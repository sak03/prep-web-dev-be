const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Prep-Web-Dev API',
        version: '1.0.0',
        description: 'API documentation for the Prep-Web-Dev project'
    },
    servers: [
        {
            url: 'http://localhost:8000',
        }
    ],
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            }
        }
    }
};

const loadSwaggerDocs = () => {
    const userDoc = JSON.parse(fs.readFileSync('./swaggerDocs/user.json'));
    const questionDoc = JSON.parse(fs.readFileSync('./swaggerDocs/question.json'));

    return {
        ...swaggerDefinition,
        paths: {
            ...userDoc.paths,
            ...questionDoc.paths
        }
    };
};

const swaggerSpec = loadSwaggerDocs();
module.exports = swaggerSpec;
