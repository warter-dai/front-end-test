pipeline {
    agent any
 
    environment {
        CI = 'true'
    }
 
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    // 根据你的项目类型使用相应的命令
                    if (isUnix()) {
                        sh 'pnpm install' // 对于使用 npm 的项目
                    } else {
                        bat 'pnpm install' // 对于 Windows 使用 npm 的项目
                    }
                }
            }
        }
        stage('Build') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'pnpm run build' // 对于使用 npm 的项目，通常是构建命令
                    } else {
                        bat 'pnpm run build' // 对于 Windows 使用 npm 的项目，通常是构建命令
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                // 这里可以根据需要将构建结果部署到服务器，例如使用 rsync, scp 或其他工具。
                script {
                    if (isUnix()) {
                        sh 'rsync -avz ./dist/ user@server:/path/to/deploy' // 示例命令，根据你的服务器配置修改
                    } else {
                        // 对于 Windows，你可能需要 PowerShell 或其他方式来部署。
                    }
                }
            }
        }
    }
}