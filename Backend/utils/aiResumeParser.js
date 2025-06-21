const pdfParse = require('pdf-parse');
const docxParse = require('docx-parser');
const fs = require('fs').promises;
const path = require('path');
const Groq = require('groq-sdk');
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

const PATTERNS = {
    skills: [
        'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'sql', 'html', 'css',
        'react', 'angular', 'vue', 'node.js', 'express', 'mongodb', 'mysql', 'postgresql',
        'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'communication',
        'vercel', 'render', 'r', 'rust', 'scala', 'dart', 'perl', 'matlab', 'shell scripting',
        'next.js', 'vue.js', 'svelte', 'jquery', 'asp', 'asp.net', '.net', 'django', 'spring',
        'react native', 'flutter', 'swift', 'objective-c', 'kotlin', 'terraform', 'oracle',
        'nmap', 'wireshark', 'iot', 'cyber security', 'oauth', 'matplotlib', 'pytorch',
        'tensorflow', 'apache hadoop', 'apache spark', 'apache kafka', 'apache hive',
        'apache flink', 'apache storm', 'jenkins', 'jira', 'blockchain', 'ethereum',
        'solidity', 'web3', 'web3.js', 'typescript', 'bootstrap', 'tailwind', 'sass', 'less'
    ],
    degrees: [
        'bachelor', 'master', 'phd', 'b.tech', 'b.e', 'm.tech', 'ssc', 'hsc',
        'bsc', 'msc', 'bca', 'mca', 'diploma', 'certificate', 'associate'
    ],
    experienceKeywords: [
        'experience', 'work history', 'employment', 'worked at', 'acted as', 'project',
        'position', 'job role', 'responsibilities', 'achievements', 'internship'
    ]
};

/**
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<Object>} Parsed resume data
 */
const parseResumeFromBuffer = async (fileBuffer, mimeType) => {
    try {
        let text = '';
        if (mimeType === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            text = data.text.toLowerCase();
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword') {
            const tempPath = path.join(__dirname, '../temp', `temp_${Date.now()}.docx`);
            await fs.mkdir(path.dirname(tempPath), { recursive: true });
            await fs.writeFile(tempPath, fileBuffer);

            text = await new Promise((resolve, reject) => {
                docxParse.parseDocx(tempPath, (data) => {
                    if (typeof data === 'string') {
                        resolve(data.toLowerCase());
                    } else {
                        reject(new Error('Failed to parse DOCX'));
                    }
                });
            });

            await fs.unlink(tempPath).catch(() => { });
        } else {
            throw new Error('Unsupported file type: ' + mimeType);
        }

        const lines = text.split('\n');
        const extractedData = {
            skills: findMatches(text, PATTERNS.skills),
            education: findEducation(lines),
            experience: findExperience(lines),
            rawText: text
        };

        return extractedData;
    } catch (error) {
        throw new Error('Failed to parse resume: ' + error.message);
    }
};

/**
 * @param {Object} resumeData - Parsed resume data
 * @param {Object} jobData - Job requirements data
 * @returns {Promise<Object>} ATS score and analysis
 */
const calculateAIATSScore = async (resumeData, jobData) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an AI that analyzes resumes and calculates ATS scores. You MUST respond with ONLY a JSON object in this exact format: {"atsScore": number, "analysis": "text", "matchedSkills": [], "missingSkills": [], "suggestions": []}`
                },
                {
                    role: "user",
                    content: `Analyze this resume against the job requirements:

                    Job Requirements:
                    - Title: ${jobData.title}
                    - Description: ${jobData.description}
                    - Required Skills: ${jobData.requirements?.skills?.required?.join(', ') || 'Not specified'}
                    - Preferred Skills: ${jobData.requirements?.skills?.preferred?.join(', ') || 'Not specified'}
                    - Experience Required: ${jobData.requirements?.experience ? `${jobData.requirements.experience.min}-${jobData.requirements.experience.max} years` : 'Not specified'}
                    - Education Required: ${jobData.requirements?.education?.join(', ') || 'Not specified'}
                    - Location: ${jobData.location || 'Not specified'}
                    
                    Resume Data:
                    - Skills: ${resumeData.skills?.join(', ') || 'None found'}
                    - Education: ${resumeData.education?.map(e => e.degree).join(', ') || 'None found'}
                    - Experience: ${resumeData.experience?.map(e => e.title).join(', ') || 'None found'}
                    
                    Respond with ONLY a JSON object containing:
                    1. "atsScore": A number from 0-100 based on how well the resume matches requirements
                    2. "analysis": A brief analysis of the match (max 200 words)
                    3. "matchedSkills": Array of skills that match between resume and job
                    4. "missingSkills": Array of required skills missing from resume
                    5. "suggestions": Array of suggestions to improve the resume

                    Example response:
                    {"atsScore": "85", 
                    "analysis": "Matches Python and MongoDB requirements, but missing Spring Boot",
                    "matchedSkills": ["Python", "MongoDB"], 
                    "missingSkills": ["Spring Boot"], 
                    "suggestions": ["Update your resume with your latest achievements"]}

                    Consider:
                    - Skill relevance and match percentage
                    - Education requirements
                    - Experience level alignment
                    - Location preferences
                    `
                }
            ],
            model: "llama3-70b-8192",
            max_tokens: 500,
            temperature: 0.1
        });

        if (!chatCompletion.choices[0]?.message?.content) {
            throw new Error('No response received from AI');
        }

        let result;
        try {
            result = JSON.parse(chatCompletion.choices[0].message.content.trim());
        } catch (e) {
            const jsonMatch = chatCompletion.choices[0].message.content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid AI response format');
            }
            result = JSON.parse(jsonMatch[0]);
        }

        if (typeof result.atsScore !== 'number' || !result.analysis) {
            throw new Error('Invalid AI response structure');
        }

        result.atsScore = Math.max(0, Math.min(100, result.atsScore));

        return result;
    } catch (error) {
        throw new Error('Failed to calculate AI ATS score: ' + error.message);
    }
};

/**
 * @param {Object} resumeData - Parsed resume data
 * @param {Object} jobData - Job requirements data
 * @returns {Object} ATS score and analysis
 */
const calculateBasicATSScore = (resumeData, jobData) => {
    let score = 0;
    const analysis = [];
    const matchedSkills = [];
    const missingSkills = [];

    // Skills evaluation (50% weight)
    const requiredSkills = jobData.requirements?.skills?.required || [];
    if (requiredSkills.length > 0) {
        const resumeSkills = resumeData.skills?.map(s => s.toLowerCase()) || [];
        const jobSkills = requiredSkills.map(s => s.toLowerCase());

        jobSkills.forEach(skill => {
            if (resumeSkills.includes(skill)) {
                matchedSkills.push(skill);
            } else {
                missingSkills.push(skill);
            }
        });

        const skillsScore = (matchedSkills.length / jobSkills.length) * 50;
        score += skillsScore;
        analysis.push(`Skills match: ${matchedSkills.length}/${jobSkills.length} (${Math.round(skillsScore)}%)`);
    }

    // Education evaluation (25% weight)
    const requiredEducation = jobData.requirements?.education || [];
    if (requiredEducation.length > 0 && resumeData.education && resumeData.education.length > 0) {
        const resumeEducation = resumeData.education.map(e => e.degree?.toLowerCase() || '');
        const hasMatchingEducation = requiredEducation.some(reqEdu =>
            resumeEducation.some(resEdu => resEdu.includes(reqEdu.toLowerCase()))
        );

        if (hasMatchingEducation) {
            score += 25;
            analysis.push('Education requirements met (+25%)');
        } else {
            score += 10;
            analysis.push('Education found but may not match requirements (+10%)');
        }
    } else if (resumeData.education && resumeData.education.length > 0) {
        score += 15;
        analysis.push('Education information found (+15%)');
    }

    // Experience evaluation (25% weight)
    const experienceReq = jobData.requirements?.experience;
    if (experienceReq && resumeData.experience && resumeData.experience.length > 0) {
        // Simple heuristic: count number of experience entries as years
        const resumeExperienceYears = resumeData.experience.length;
        const minRequired = experienceReq.min || 0;
        const maxRequired = experienceReq.max || 100;

        if (resumeExperienceYears >= minRequired && resumeExperienceYears <= maxRequired) {
            score += 25;
            analysis.push(`Experience matches requirement: ${resumeExperienceYears} years (+25%)`);
        } else if (resumeExperienceYears >= minRequired) {
            score += 20;
            analysis.push(`Experience exceeds minimum: ${resumeExperienceYears} years (+20%)`);
        } else {
            score += 10;
            analysis.push(`Experience below requirement: ${resumeExperienceYears} years (+10%)`);
        }
    } else if (resumeData.experience && resumeData.experience.length > 0) {
        score += 15;
        analysis.push('Work experience found (+15%)');
    }

    return {
        atsScore: Math.round(Math.min(100, score)), // Cap at 100
        analysis: analysis.join(', '),
        matchedSkills,
        missingSkills
    };
};

function findMatches(text, patterns) {
    return patterns.filter(pattern => text.includes(pattern.toLowerCase()));
}

function findEducation(lines) {
    return lines
        .filter(line => PATTERNS.degrees.some(degree => line.includes(degree)))
        .map(line => ({
            degree: line.trim(),
            year: line.match(/20\d{2}/)?.[0] || null
        }))
        .filter(edu => edu.degree.length > 0);
}

function findExperience(lines) {
    return lines
        .filter(line => PATTERNS.experienceKeywords.some(keyword => line.includes(keyword)))
        .map(line => ({
            title: line.trim(),
            duration: line.match(/(\d+)\s*(year|month|yr|mo)/i)?.[0] || null
        }))
        .filter(exp => exp.title.length > 0)
        .slice(0, 10);
}

/**
 * Compresses a PDF file using pdf-lib
 * @param {Buffer} buffer - The PDF file buffer to compress
 * @param {string} compressionLevel - Compression level: 'low', 'medium', or 'high'
 * @returns {Promise<Object>} Object containing compressed buffer and stats
 */
async function compressPDF(buffer, compressionLevel = 'medium') {
    try {
        const pdfDoc = await PDFDocument.load(buffer);

        // Define compression options based on level
        let options = {};
        switch (compressionLevel) {
            case 'low':
                options = { useObjectStreams: false };
                break;
            case 'high':
                options = {
                    useObjectStreams: true,
                    addXrefStreams: true,
                    objectsPerTick: 100,
                };
                break;
            case 'medium':
            default:
                options = {
                    useObjectStreams: true
                };
                break;
        }

        // Save with compression options
        const compressedPdfBytes = await pdfDoc.save(options);

        const originalSize = buffer.length;
        const compressedSize = compressedPdfBytes.length;
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

        return {
            buffer: Buffer.from(compressedPdfBytes),
            originalSize,
            compressedSize,
            compressionRatio
        };
    } catch (error) {
        console.error('Error compressing PDF:', error);
        // Return original buffer if compression fails
        return {
            buffer,
            originalSize: buffer.length,
            compressedSize: buffer.length,
            compressionRatio: 0
        };
    }
}

/**
 * Generates a random filename for uploaded files
 * @returns {string} A UUID to use as a filename
 */
function generateRandomFilename() {
    return uuidv4();
}

module.exports = {
    parseResumeFromBuffer,
    calculateAIATSScore,
    calculateBasicATSScore,
    compressPDF,
    generateRandomFilename
};