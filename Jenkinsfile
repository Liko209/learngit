node{
    nodejs('NodeJS10.9') {
        stage('Install Dependences'){
            sh "ls -al"
            sh "rm -rf **/package-lock.json"
            sh "npm install"
        }
        stage('Run SA'){
            sh "npm run lint-all"
        }
        stage('Run UT'){
            sh "CI=true node scripts/test.js --env=jsdom 2>&1 | awk '/Summary of all failing/,0'"
        }
        stage('Generate coverage report'){
            echo 'TODO'
            // sh "npm run test:cover"
            // coverageFolder=coverage/$subDomain/$BUILD_NUMBER
            // syncFolderToServer $project/coverage/ $coverageFolder
            // UTUrl=https://coverage.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/lcov-report/index.html
            // addEnv UTResult="> **UT Coverage Report Url**: $UTUrl"
        }
        stage('Build'){
            parallel {
                stage('Build Application') {
                    sh 'npm run build:app'
                    echo 'TODO: deploy to application-xxx.fiji.gliprc.com'
                }
                stage('Build Demo') {
                    sh 'npm run build:demo'
                    echo 'TODO: deploy to demo-xxx.fiji.gliprc.com'
                }
            }
        }
        stage('TODO:Run E2E'){
            echo 'RUN E2E'
        }
        stage('Send Email') {
            echo 'TODO'
        }
    }
}