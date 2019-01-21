import jenkins.model.*

// conditional stage
def condStage(Map args, Closure block) {
    assert args.name, 'stage name is required'
    String name = args.name
    Boolean enable = (null == args.enable) ? true: args.enable
    Integer time = (null == args.timeout) ? 600: args.timeout
    Boolean activity = (null == args.activity) ? true: args.activity
    return timeout(time: time, activity: activity, unit: 'SECONDS') {
        stage(name, enable ? block : {
            echo "Skip stage: ${name}"
        })
    }
}


// common stage
def checkoutStage(String prefix,  String gitUrl, String gitBranch, String gitCredentialId) {
    return condStage(name: "${prefix}: checkout") {
        checkout ([
            $class: 'GitSCM',
            branches: [[name: "*/${gitBranch}"]],
            extensions: [
                [$class: 'CleanBeforeCheckout'],
            ],
            userRemoteConfigs: [
                [
                    credentialsId: gitCredentialId,
                    url: gitUrl,
                ],
            ]
        ])
    }
}


// stages various platform support
def runOnSeleniumGrid(
    String nodeName,

    String gitUrl,
    String gitBranch,
    String gitCredentialId,

    String siteUrl,
    String siteEnv,

    String[] browsers,
    Integer chuckSize,
    String seleniumServer,
    Integer concurrency,
    Integer maxRetry
) {
    if (!browsers && !nodeName)
        return
    node (nodeName) {
        // install nodejs tool
        env.NODEJS_HOME = tool nodejsTool
        env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
        env.TZ='UTC-8'

        // stage 1: checkout stage
        checkoutStage('selenium-grid', gitUrl, gitBranch, gitCredentialId)
        // stage 2: e2e automation (no exception should be thrown in this stage)
        dir('tests/e2e/testcafe') {
            sh 'npm install --unsafe-perm --cache-min=9999'
            sh 'mkdir -p ./screenshots'
            List<List<String>> fixtureChunks = sh(returnStdout: true, script: 'cat lint/*.txt').split('\n').collect{ it.trim() }.collate(chuckSize)

            Map tasks = [:]
            browsers.each { browser ->
                parallelTasks[browser] = {
                    condStage(name: "selenium-grid: e2e ${browser}") {
                        // the reason we split fixtures into small chunk is there is a chance that browser connection is lost during execution
                        // in order to reduce the effect of this cases
                        fixtureChunks.each { fixtures ->
                            String date = new Date().format("yyyy-MM-dd", timezone=TimeZone.getTimeZone("Asia/Shanghai"))
                            withEnv([
                                "FIXTURES=${fixtures.join(',')}",
                                "SITE_URL=${siteUrl}",
                                "SITE_ENV=${siteEnv}",
                                "BROWSERS=${browser}",
                                "SELENIUM_SERVER=${seleniumServer}",
                                "CONCURRENCY=${concurrency}",
                                "SCREENSHOTS_PATH=./screenshots",
                                "ENABLE_REMOTE_DASHBOARD=true",
                                "DEBUG_MODE=false",
                                "SCREENSHOT_WEBP_QUALITY=80",
                                "RUN_NAME=[Jupiter][Daily][${date}]",
                            ]) {
                                for (int i = 0; i < maxRetry; i++) {
                                    Integer status = sh(returnStatus: true, script: 'npm run e2e')
                                    if (! (status in [1, 7]))
                                        break
                                    sleep 60 * 5
                                }
                            }
                        }
                    }
                }
            }
            parallel tasks
        }
        // post execution: archive report
        allure(
            commandline: 'allure-2.7',
            includeProperties: false,
            results: [[ path: 'tests/e2e/testcafe/allure/allure-results' ]]
        )
        // post execution:
    }
}

//


// start to build
String seleniumNode = params.SELENIUM_NODE
String winElectronNode = params.WIN_ELECTRON_NODE
String macElectronNode = params.MAC_ELECTRON_NODE

String gitUrl = params.GIT_URL
String gitBranch = params.GIT_BRANCH
String gitCredentialId = params.GIT_CREDENTIAL

String siteUrl = params.SITE_URL
String siteEnv = params.SITE_ENV

String[] browsers = params.BROWSERS.split(',').collect{ it.trim() }
String[] seleniumBrowsers = browsers.findAll{ it.startsWith('selenium:')}


Map tasks = [
    'selenium-grid': {
        runOnSeleniumGrid(seleniumNode, gitUrl, gitBranch, gitCredentialId, siteUrl, siteEnv, seleniumBrowsers)
    },

    'electron-mac': {

    },

    'electron-win': {

    },
]

parallel(tasks)













node('SDET-XMN054'){
    try{
        stage("run testcafe test"){
            sh '''
            git clean -xdf
            cd $WORKSPACE/tests/e2e/testcafe
            npm install
            '''
        }
        stage("parallel browsers"){
            def str = params.BROWSERS
            def tasks = [:]
            def aaa = str.split(",")
            for (int i = 0; i < aaa.length; i++) {
                def t = i*5
                def browser = aaa[i]
                def cmd = '''cd tests/e2e/testcafe/
                        BROWSERS="'''+browser+'''" npm run e2e'''
                tasks[aaa[i]] = {
                    stage("run e2e") {
                        sleep t
                        timeout(time:45, unit: 'MINUTES', activity: true) {
                            def status = 0
                            for (int j = 0; j < browser_error_max_retry.toInteger(); j++ ){
                                status = sh returnStatus: true, script: cmd
                                if (status == 1 || status == 7) {
                                    sleep 300
                                    continue
                                }
                                else {
                                    break
                                }
                            }
                            if (status) {
                                currentBuild.result = 'FAILED'
                            }
                        }
                    }
                }
            }
            parallel(tasks)
        }
    }
    finally{
            stage('Archive Results'){
                allure commandline: 'allure-2.7',includeProperties: false, jdk: '', results: [[path: 'tests/e2e/testcafe/allure/allure-results']]
            }
            stage("post"){
                if (params.QUIET_MODE == "false"){
                    def mark = ':no_entry_sign:'
                    if (currentBuild.result == "SUCCESS" | currentBuild.result == null){
                        mark = ':white_check_mark:'
                    }
                    emailext body: '''
$PROJECT_NAME - Build # $BUILD_NUMBER - $BUILD_STATUS!

> **Browsers**: $BROWSERS
> **Results**: ${BUILD_LOG_REGEX,regex=".*/.* failed .*",maxMatches=0,showTruncatedLines=false}
> **Status** : '''+mark+''' ${BUILD_STATUS}
> **Details**: ${BUILD_URL}console
> **Allure Report**: ${BUILD_URL}allure
''', subject: '$PROJECT_NAME - Build # $BUILD_NUMBER - $BUILD_STATUS!', to: 'jupiter_develop_ci@ringcentral.glip.com, test_message@ringcentral.glip.com'
                }else{
                    echo "quiet mode, no email"
                }
            }
        }
    }
