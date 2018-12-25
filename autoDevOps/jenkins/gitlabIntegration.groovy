import jenkins.model.*
import java.net.URI
import com.dabsquared.gitlabjenkins.cause.GitLabWebHookCause
import hudson.AbortException

final String SUCCESS_EMOJI = ':white_check_mark:'
final String FAILURE_EMOJI = ':negative_squared_cross_mark:'
final String ABORTED_EMOJI = ':no_entry:'

// cancel old build
@NonCPS
def cancelOldBuildOfSameCause() {
    GitLabWebHookCause currentBuildCause = currentBuild.rawBuild.getCause(GitLabWebHookCause.class)
    if (null == currentBuildCause)
        return
    def currentCauseData = currentBuildCause.getData()

    currentBuild.rawBuild.getParent().getBuilds().each { build ->
        if (!build.isBuilding() || currentBuild.rawBuild.getNumber() <= build.getNumber())
            return
        GitLabWebHookCause cause = build.getCause(GitLabWebHookCause.class)
        if (null == cause)
            return
        def causeData = cause.getData()

        if (currentCauseData.sourceBranch == causeData.sourceBranch
                && currentCauseData.sourceRepoName == causeData.sourceRepoName
                && currentCauseData.targetBranch == causeData.targetBranch
                && currentCauseData.targetRepoName == causeData.targetRepoName) {
            build.doStop()
            println "build ${build.getFullDisplayName()} is canceled"
        }
    }
}

// conditional stage
def condStage(Map args, Closure block) {
    assert args.name, 'stage name is required'
    String name = args.name
    Boolean enable = (null == args.enable) ? true: args.enable
    Integer time = (null == args.timeout) ? 1800 : args.timeout
    return timeout(time: time, unit: 'SECONDS') {
        stage(name, enable ? block : {
            echo "Skip stage: ${name}"
        })
    }
}

// ssh helper
def sshCmd(String remoteUri, String cmd) {
    URI uri = new URI(remoteUri)
    GString sshCmd = "ssh -q -o StrictHostKeyChecking=no -p ${uri.getPort()} ${uri.getUserInfo()}@${uri.getHost()}"
    sh "${sshCmd} ${cmd}"
}

// deploy helper
def rsyncFolderToRemote(String sourceDir, String remoteUri, String remoteDir) {
    URI uri = new URI(remoteUri)
    sshCmd(remoteUri, "mkdir -p ${remoteDir}".toString())
    String rsyncRemoteUri = "${uri.getUserInfo()}@${uri.getHost()}:${remoteDir}".toString()
    sh "rsync -azPq --delete --progress -e 'ssh -o StrictHostKeyChecking=no -p ${uri.getPort()}' ${sourceDir} ${rsyncRemoteUri}"
    sshCmd(remoteUri, "chmod -R 755 ${remoteDir}".toString())
}

static String getSubDomain(String sourceBranch, String targetBranch) {
    if ("master" == sourceBranch)
        return 'release'
    if (sourceBranch in ["develop", "stage"])
        return sourceBranch
    String subDomain = sourceBranch.replaceAll(/[\/\.]/, '-').toLowerCase()
    if (null != targetBranch && sourceBranch != targetBranch)
        return "mr-${subDomain}".toString()
    return subDomain
}

static String getMessageChannel(String sourceBranch, String targetBranch) {
    if (null != targetBranch && sourceBranch != targetBranch)
        return "jupiter_mr_ci@ringcentral.glip.com"
    switch (sourceBranch) {
        case "master": return "jupiter_master_ci@ringcentral.glip.com"
        case "develop": return "jupiter_develop_ci@ringcentral.glip.com"
        default: return "jupiter_push_ci@ringcentral.glip.com"
    }
}

def safeMail(addresses, subject, body) {
    addresses.each {
        try {
            mail to: it, subject: subject, body: body
        } catch (e) {
            println e
        }
    }
}

def buildReport(result, buildUrl, report) {
    List lines = []
    lines.push("**Build Result**: ${result}")
    lines.push("**Detail**: ${buildUrl}")
    if (null != report.saReport)
        lines.push("**Static Analysis**: ${report.saReport}")
    if (null != report.applicationUrl)
        lines.push("**Application URL**: ${report.applicationUrl}")
    if (null != report.coverage)
        lines.push("**Coverage Report**: ${report.coverage}")
    if (null != report.juiUrl)
        lines.push("**Storybook URL**: ${report.juiUrl}")
    if (null != report.e2eUrl)
        lines.push("**E2E Report**: ${report.e2eUrl}")
    return lines.join(' \n')
}

// params
String jobName = env.JOB_BASE_NAME
String buildNode = env.BUILD_NODE
String scmCredentialId = env.SCM_CREDENTIAL
String gitlabApi = env.GITLAB_API
String gitlabCredentialId = env.GITLAB_CREDENTIAL
String npmRegistry = env.NPM_REGISTRY
String nodejsTool = env.NODEJS_TOOL
String deployUri = env.DEPLOY_URI
String deployCredentialId = env.DEPLOY_CREDENTIAL
String deployBaseDir = env.DEPLOY_BASE_DIR
String rcCredentialId = env.E2E_RC_CREDENTIAL

// derivative value
Boolean skipEndToEnd = 'PUSH' == env.gitlabActionType && 'develop' != env.gitlabSourceBranch
Boolean skipUpdateGitlabStatus = 'PUSH' == env.gitlabActionType && 'develop' != env.gitlabSourceBranch
Boolean buildRelease = env.gitlabSourceBranch.startsWith('release') || 'master' == env.gitlabSourceBranch

String subDomain = getSubDomain(env.gitlabSourceBranch, env.gitlabTargetBranch)
String applicationUrl = "https://${subDomain}.fiji.gliprc.com".toString()

// glip channel
def reportChannels = [
        env.gitlabUserEmail,
        getMessageChannel(env.gitlabSourceBranch, env.gitlabTargetBranch)
]

// report
Map report = [:]
report.buildUrl = env.BUILD_URL

// start
skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'pending')
cancelOldBuildOfSameCause()

node(buildNode) {
    skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'running')

    // install nodejs tool
    env.NODEJS_HOME = tool nodejsTool
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
    env.TZ='UTC-8'

    try {
        // start to build
        stage ('Collect Facts') {
            sh 'env'
            sh 'df -h'
            sh 'uptime'
            sh 'git --version'
            sh 'node -v'
            sh 'rsync --version'
        }

        stage ('Checkout') {
            checkout ([
                    $class: 'GitSCM',
                    branches: [[name: "${env.gitlabSourceNamespace}/${env.gitlabSourceBranch}"]],
                    extensions: [
                            [$class: 'PruneStaleBranch'],
                            [$class: 'CleanCheckout'],
                            [
                                    $class: 'PreBuildMerge',
                                    options: [
                                            fastForwardMode: 'FF',
                                            mergeRemote: env.gitlabTargetNamespace?: env.gitlabSourceNamespace,
                                            mergeTarget: env.gitlabTargetBranch?: env.gitlabSourceBranch
                                    ]
                            ]
                    ],
                    userRemoteConfigs: [
                            [
                                    credentialsId: scmCredentialId,
                                    name: env.gitlabTargetNamespace,
                                    url: env.gitlabTargetRepoSshURL
                            ],
                            [
                                    credentialsId: scmCredentialId,
                                    name: env.gitlabSourceNamespace,
                                    url: env.gitlabSourceRepoSshURL
                            ]
                    ]
            ])
        }

        stage ('Install Dependencies') {
            sh "echo 'registry=${npmRegistry}' > .npmrc"
            sshagent (credentials: [scmCredentialId]) {
                sh 'npm install typescript ts-node --unsafe-perm'
                sh 'npm install --unsafe-perm'
            }
        }
        parallel (
                'Static Analysis': {
                    stage(name: 'Static Analysis') {
                        sh 'mkdir -p lint'
                        try {
                            [
                                    ['application', 'lint/application-tslint-report.txt'],
                                    ['packages/foundation', 'lint/foundation-tslint-report.txt'],
                                    ['packages/sdk', 'lint/sdk-tslint-report.txt'],
                                    ['packages/jui', 'lint/jui-tslint-report.txt'],

                            ].each {
                                sh "npx tslint --project ${it[0]} --out ${it[1]}"
                            }
                            report.saReport = "${SUCCESS_EMOJI} no tslint error"
                        } catch (e) {
                            String saErrorMessage = sh(returnStdout: true, script: 'cat lint/*.txt').trim()
                            report.saReport = "${FAILURE_EMOJI} ${saErrorMessage}"
                        }
                    }
                },
                'Unit Test': {
                    stage('Unit Test') {
                        sh 'npm run test:cover'
                        publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: false,
                                keepAll: true,
                                reportDir: 'coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage',
                                reportTitles: 'Coverage'
                        ])
                        report.coverage = "${env.BUILD_URL}Coverage"
                    }
                },
                'Build JUI' : {
                    condStage(name: 'Build JUI') {
                        sh 'npm run build:ui'
                    }

                    condStage(name: 'Deploy JUI') {
                        String sourceDir = "packages/jui/storybook-static/"  // !!! don't forget trailing '/'
                        String deployDir = "${deployBaseDir}/${subDomain}-jui".toString()
                        sshagent(credentials: [deployCredentialId]) {
                            rsyncFolderToRemote(sourceDir, deployUri, deployDir)
                        }
                    }

                    report.juiUrl = "https://${subDomain}-jui.fiji.gliprc.com".toString()
                    safeMail(
                            reportChannels,
                            "Storybook Deployment Successful",
                            "**Storybook deployment successful**: ${report.juiUrl}"

                    )
                },
                'Build Application': {
                    condStage(name: 'Build Application') {
                        // FIXME: move this part to build script
                        sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
                        sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
                        if (buildRelease) {
                            sh 'npm run build:release'
                        } else {
                            dir('application') {
                                sh 'npm run build'
                            }
                        }
                    }

                    condStage(name: 'Deploy Application') {
                        String sourceDir = "application/build/"  // !!! don't forget trailing '/'
                        String deployDir = "${deployBaseDir}/${subDomain}".toString()
                        sshagent(credentials: [deployCredentialId]) {
                            rsyncFolderToRemote(sourceDir, deployUri, deployDir)
                        }
                    }
                    report.applicationUrl = applicationUrl
                    safeMail(
                            reportChannels,
                            "Jupiter Deployment Successful",
                            "**Jupiter deployment successful**: ${report.applicationUrl}"
                    )
                }
        )

        condStage (name: 'E2E Automation', timeout: 1800, enable: !skipEndToEnd) {
            String hostname =  sh(returnStdout: true, script: 'hostname -f').trim()
            String startTime = sh(returnStdout: true, script: "TZ=UTC-8 date +'%F %T'").trim()
            withEnv([
                    "HOST_NAME=${hostname}",
                    "SITE_URL=${applicationUrl}",
                    "SITE_ENV=${env.E2E_SITE_ENV}",
                    "SCREENSHOTS_PATH=${env.E2E_SCREENSHOTS_PATH}",
                    "SELENIUM_SERVER=${env.E2E_SELENIUM_SERVER}",
                    "ENABLE_REMOTE_DASHBOARD=${env.E2E_ENABLE_REMOTE_DASHBOARD}",
                    "BROWSERS=${env.E2E_BROWSERS}",
                    "CONCURRENCY=${env.E2E_CONCURRENCY}",
                    "ACTION=ON_MERGE",
                    "DEBUG_MODE=false",
                    "QUARANTINE_MODE=true",
                    "STOP_ON_FIRST_FAIL=true",
                    "SCREENSHOT_WEBP_QUALITY=80",
                    "RUN_NAME=[Jupiter][Pipeline][Merge][${startTime}][${env.gitlabSourceBranch}][${env.gitlabMergeRequestLastCommit}]",
            ]) {dir("tests/e2e/testcafe") {
                sh 'env'
                sh "echo 'registry=${npmRegistry}' > .npmrc"
                sh 'npm install --unsafe-perm'
                if ('true' == env.E2E_ENABLE_REMOTE_DASHBOARD){
                    sh 'npx ts-node create-run-id.ts'
                    report.e2eUrl = sh(returnStdout: true, script: 'cat reportUrl').trim()
                } else {
                    report.e2eUrl = 'beat dashboard is disabled'
                }
                withCredentials([usernamePassword(
                        credentialsId: rcCredentialId,
                        usernameVariable: 'RC_PLATFORM_APP_KEY',
                        passwordVariable: 'RC_PLATFORM_APP_SECRET')]) {
                    sh "npm run e2e"
                }
            }}
        }
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'success')
        def description = currentBuild.getDescription() + '\n' + buildReport("${SUCCESS_EMOJI} Success", env.BUILD_URL, report)
        safeMail(
                reportChannels,
                "Jenkins Pipeline Success: ${currentBuild.fullDisplayName}",
                description,
        )
        currentBuild.setDescription(description)
    } catch (e) {
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'failed')
        String statusTitle = "${FAILURE_EMOJI} Failure"
        if (e in InterruptedException)
            statusTitle = ":no_entry: Aborted"
        def description = currentBuild.getDescription() + '\n' + buildReport(statusTitle, env.BUILD_URL, report)
        safeMail(
                reportChannels,
                "Jenkins Pipeline Stop: ${currentBuild.fullDisplayName}",
                description,
        )
        currentBuild.setDescription(description)
        throw e
    }
}