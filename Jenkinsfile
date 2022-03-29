pipeline {
    agent any
    stages { 
        stage('Checkout Deployment') {
            steps {
                dir("$WORKSPACE/satyrn-deployment") {
                    git(
                        branch: 'master',
                        credentialsId: 'git-cred-c3',
                        url: 'git@github.com:nu-c3lab/satyrn-deployment.git'
                    )
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Starting docker build!'
                sh 'ls'
                sh 'docker build -t satyrn-ux . --network=host'
            }
        }

        stage('Push') {
            steps {
                echo  'Logging in!'
                sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 304793330600.dkr.ecr.us-east-1.amazonaws.com'
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
            }
        }

        stage('Deploy') {
            steps {
                dir("$WORKSPACE/satyrn-deployment") {
                    sh 'helm upgrade --install satyrn-ux charts/common --values charts/satyrn-ux/values-override-dev.yaml --create-namespace --namespace dev-satyrn-ux --set image.tag=$GIT_COMMIT'
                }
            }
        }
    }
}

