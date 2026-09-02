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
                sh 'echo "Verifying NEXUS source code..."'
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

        stage('Prepare Deployment Network') {
            steps {
                sh '''
                    docker network inspect nexus-it-ops-cicd_default >/dev/null 2>&1 || \
                    docker network create nexus-it-ops-cicd_default

                    docker network connect \
                      --alias mongo \
                      nexus-it-ops-cicd_default \
                      itsm-mongodb 2>/dev/null || true
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                    docker rm -f itsm-backend 2>/dev/null || true
                    docker rm -f itsm-frontend 2>/dev/null || true

                    docker compose up -d --no-deps backend frontend
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                sh '''
                    echo "=== Running NEXUS Containers ==="
                    docker ps --filter "name=itsm-"
                '''

                sh '''
                    echo "=== Backend Health Check ==="
                    sleep 5
                    docker exec itsm-backend wget -qO- http://localhost:5000/health || exit 1
                '''
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