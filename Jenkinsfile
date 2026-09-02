pipeline {
    agent any

    stages {

        stage('Environment Check') {
            steps {
                sh 'echo "=== NEXUS IT OPS CI/CD ==="'
                sh 'pwd'
                sh 'docker version'
                sh 'docker compose version'
            }
        }

        stage('Checkout Verification') {
            steps {
                sh 'echo "Checking out NEXUS source code..."'
                sh 'ls -la'
                sh 'test -f docker-compose.yml'
                sh 'test -f backend/Dockerfile'
                sh 'test -f frontend/Dockerfile'
                sh 'test -f Jenkinsfile'
            }
        }

        stage('Frontend Docker Build') {
            steps {
                sh 'docker compose build frontend'
            }
        }

        stage('Backend Docker Build') {
            steps {
                sh 'docker compose build backend'
            }
        }

        stage('Compose Validation') {
            steps {
                sh 'docker compose config'
            }
        }

        stage('Deployment') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Deployment Verification') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ NEXUS IT OPS CI/CD pipeline completed successfully!'
        }

        failure {
            echo '❌ NEXUS IT OPS CI/CD pipeline failed.'
        }
    }
}