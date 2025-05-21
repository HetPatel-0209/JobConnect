const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Parse resume PDF and extract relevant information
 * @param {string} filePath - Path to the PDF file
 * @returns {Object} Extracted information from resume
 */
exports.parseResume = async (filePath) => {
    try {
        // Read the PDF file
        const dataBuffer = await fs.readFile(filePath);
        
        // Parse PDF content
        const data = await pdfParse(dataBuffer);
        const text = data.text.toLowerCase();

        // Extract information using regex and pattern matching
        const extractedData = {
            skills: extractSkills(text),
            education: extractEducation(text),
            experience: extractExperience(text)
        };

        return extractedData;
    } catch (error) {
        throw new Error('Failed to parse resume: ' + error.message);
    }
};

/**
 * Extract skills from resume text
 * @param {string} text - Resume text content
 * @returns {string[]} Array of skills
 */
function extractSkills(text) {
    // Common programming languages and technologies
    const commonSkills = [
        'javascript', 'python', 'java', 'c++', 'ruby', 'php',
        'html', 'css', 'react', 'angular', 'vue', 'node.js',
        'express', 'mongodb', 'mysql', 'postgresql',
        'aws', 'docker', 'kubernetes', 'git',
        'agile', 'scrum', 'leadership', 'communication'
    ];

    return commonSkills.filter(skill => text.includes(skill.toLowerCase()));
}

/**
 * Extract education information from resume text
 * @param {string} text - Resume text content
 * @returns {Object[]} Array of education entries
 */
function extractEducation(text) {
    const education = [];
    const degrees = [
        'bachelor', 'master', 'phd', 'b.tech', 'b.e', 'm.tech',
        'bsc', 'msc', 'bca', 'mca'
    ];

    // Simple pattern matching for education
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        for (const degree of degrees) {
            if (line.includes(degree)) {
                education.push({
                    degree: line,
                    year: extractYear(line)
                });
                break;
            }
        }
    }

    return education;
}

/**
 * Extract work experience information from resume text
 * @param {string} text - Resume text content
 * @returns {Object[]} Array of experience entries
 */
function extractExperience(text) {
    const experience = [];
    const experienceKeywords = [
        'experience', 'work history', 'employment', 'worked at',
        'position', 'job role'
    ];

    // Simple pattern matching for experience
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        for (const keyword of experienceKeywords) {
            if (line.includes(keyword)) {
                experience.push({
                    description: line,
                    duration: extractDuration(line)
                });
                break;
            }
        }
    }

    return experience;
}

/**
 * Extract year from text
 * @param {string} text - Text containing year
 * @returns {string|null} Extracted year or null
 */
function extractYear(text) {
    const yearMatch = text.match(/20\d{2}/);
    return yearMatch ? yearMatch[0] : null;
}

/**
 * Extract duration from text
 * @param {string} text - Text containing duration
 * @returns {string|null} Extracted duration or null
 */
function extractDuration(text) {
    const durationMatch = text.match(/(\d+)\s*(year|month|yr|mo)/i);
    return durationMatch ? durationMatch[0] : null;
}
