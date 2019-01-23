import jenkins.model.*
import java.util.TimeZone

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
    String seleniumServer,

    Integer concurrency,
    Integer maxRetry,
    Integer chuckSize
) {
    if (!browsers && !nodeName)
        return
    node (nodeName) {
        // install nodejs tool
        env.NODEJS_HOME = tool "v10.9.0"
        env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"

        // global env
        env.TZ='UTC-8'

        sh 'env'

        // stage 1: checkout stage
        checkoutStage('selenium-grid', gitUrl, gitBranch, gitCredentialId)

        // stage 2: e2e automation
        dir('tests/e2e/testcafe') { withEnv(["ENABLE_REMOTE_DASHBOARD=true"]) {
            // install dependencies
            sh 'npm install --unsafe-perm --cache-min=9999'

            // screenshot path for allure report
            sh 'mkdir -p ./screenshots'

            // create an report id for beat dashboard
            String localDate = new Date().format("yyyy-MM-dd", TimeZone.getTimeZone("Asia/Shanghai"))
            withEnv([ "RUN_NAME=[Jupiter][Daily][${gitBranch}][${siteUrl}][${localDate}]", ]) {
                sh 'npx ts-node create-run-id.ts'
            }

            // todo: log this info to description
            echo sh(returnStdout: true, script: 'cat reportUrl || true').trim()

            // split fixtures into small chucks and group by check size
            List<List<String>> fixtureChunks = sh(returnStdout: true, script: 'npx ts-node ./scripts/ls-fixtures.ts').split('\n').collect{ it.trim() }.collate(chuckSize)

            Map tasks = [:]
            // split tasks by browsers level
            browsers.each { browser ->
                parallelTasks[browser] = {
                    condStage(name: "selenium-grid: e2e ${browser}") {
                        // the reason we split fixtures into small chunk is there is a chance that browser connection is lost during execution
                        // in order to reduce the effect of this cases
                        fixtureChunks.each { fixtures ->
                            withEnv([
                                "FIXTURES=${fixtures.join(',')}",
                                "SITE_URL=${siteUrl}",
                                "SITE_ENV=${siteEnv}",
                                "BROWSERS=${browser}",
                                "SELENIUM_SERVER=${seleniumServer}",
                                "CONCURRENCY=${concurrency}",
                                "SCREENSHOTS_PATH=./screenshots",
                                "DEBUG_MODE=false",
                                "SCREENSHOT_WEBP_QUALITY=80",
                            ]) {
                                // print env for debug
                                sh 'env'
                                // retry until success if the error is cause by lost connection
                                for (int i = 0; i < maxRetry; i++) {
                                    Integer status = sh(returnStatus: true, script: 'npm run e2e')
                                    echo "exit code is ${status}"
                                    if (! (status in [1, 7]))  // status code of lost connection
                                        break
                                    sleep 60 // retry after 1 min
                                }
                            }
                        }
                    }
                }
            }
            parallel tasks
        }}
        // post execution: archive report
        // fixme: following code is not portable because allure and java should pre-install on the node
        allure(
            commandline: 'allure-2.7',
            includeProperties: false,
            results: [[ path: 'tests/e2e/testcafe/allure/allure-results' ]]
        )
    }
}

//


// start to build

// fixme: it seems like node type can only be fetch from env, I don't know why
String seleniumNode = params.SELENIUM_NODE || env.SELENIUM_NODE
// String winElectronNode = params.WIN_ELECTRON_NODE
// String macElectronNode = params.MAC_ELECTRON_NODE

String gitUrl = params.GIT_URL
String gitBranch = params.GIT_BRANCH
String gitCredentialId = params.GIT_CREDENTIAL

String siteUrl = params.SITE_URL
String siteEnv = params.SITE_ENV


String[] browsers = params.BROWSERS.split('\n').collect{ it.trim() }
String[] seleniumBrowsers = browsers.findAll{ it.startsWith('selenium:')}
String seleniumServer = params.SELENIUM_SERVER

// todo: fixtures, tags should also be configurable

Map tasks = [
    'selenium-grid': {
        runOnSeleniumGrid(
            seleniumNode,
            gitUrl, gitBranch, gitCredentialId,
            siteUrl, siteEnv,
            seleniumBrowsers, seleniumServer,
            2, 2, 5)
    },

    'electron-mac': {

    },

    'electron-win': {

    },
]

parallel(tasks)
