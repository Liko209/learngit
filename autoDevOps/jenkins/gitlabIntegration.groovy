import jenkins.model.*
import java.net.URI
import com.dabsquared.gitlabjenkins.cause.GitLabWebHookCause


def rsyncFolderRemoteToRemote(String fromRemoteUri, String fromRemoteDir, String toRemoteUri, String toRemoteDir) {
    URI fromUri = new URI(fromRemoteUri)

    String from = "${fromUri.getUserInfo()}@${fromUri.getHost()}:${fromRemoteDir}".toString()

    sshCmd(toRemoteUri, "scp -r -P ${fromUri.getPort()} ${from} ${toRemoteDir}")

    sshCmd(toRemoteUri, "chmod -R 755 ${toRemoteDir}".toString())
}

def doesRemoteDirectoryExist(String remoteUri, String remoteDir) {
    // the reason to use stdout instead of return code is,
    // by return code we can not tell the error of ssh itself or dir not exists
    return 'true' == sshCmd(remoteUri, "[ -d ${remoteDir} ] && echo 'true' || echo 'false'")
}

def updateRemoteCopy(String remoteUri, String linkSource, String linkTarget) {
    updateRemoteCopy(remoteUri, linkSource, linkTarget, true)
}

def updateRemoteCopy(String remoteUri, String linkSource, String linkTarget, Boolean delete) {
    assert '/' != linkTarget, 'What the hell are you doing?'
    if (delete) {
        // remove link if exists
        println sshCmd(remoteUri, "[ -L ${linkTarget} ] && unlink ${linkTarget} || true")
        // remote directory if exists
        println sshCmd(remoteUri, "[ -d ${linkTarget} ] && rm -rf ${linkTarget} || true")
    }
    // ensure target directory existed
    println sshCmd(remoteUri, "mkdir -p ${linkTarget}")
    // create copy to new target
    println sshCmd(remoteUri, "cp -rf ${linkSource}/* ${linkTarget}/")
}

def updatePrecacheRevision(String remoteUri, String appDir, String sha, long timestamp) {
    String cmd = """rm -f ${appDir}/precache-manifest.js.bak || true && cp -f ${appDir}/precache-manifest.*.js ${appDir}/precache-manifest.js.bak &&  awk -v rev='    \\"revision\\": \\"${timestamp}\\",' '/versionInfo/{sub(/.+/,rev,last)} NR>1{print last} {last=\\\$0} END {print last}' ${appDir}/precache-manifest.js.bak > ${appDir}/precache-manifest.*.js"""
    println sshCmd(remoteUri, cmd)
}

def updateVersionInfo(String remoteUri, String appDir, String sha, long timestamp) {
    String cmd = "sed -i 's/{{deployedCommit}}/${sha.substring(0,9)}/;s/{{deployedTime}}/${timestamp}/' ${appDir}/static/js/versionInfo.*.chunk.js || true"
    println sshCmd(remoteUri, cmd)
}


def formatGlipReport(report) {
    List lines = []
    if (null != report.buildResult)
        lines.push("**Build Result**: ${report.buildResult}")
    if (null != report.description)
        lines.push("**Description**: ${aTagToGlipLink(report.description)}")
    if (null != report.jobUrl)
        lines.push("**Job URL**: ${report.jobUrl}")
    if (null != report.saReport)
        lines.push("**Static Analysis**: ${report.saReport}")
    if (null != report.coverage)
        lines.push("**Coverage Report**: ${report.coverage}")
    if (null != report.coverageDiff)
        lines.push("**Coverage Changes**: ${report.coverageDiff}")
    if (null != report.coverageDiffDetail)
        lines.push("**Coverage Changes Detail**: ${report.coverageDiffDetail}")
    if (null != report.appUrl)
        lines.push("**Application URL**: ${report.appUrl}")
    if (null != report.juiUrl)
        lines.push("**Storybook URL**: ${report.juiUrl}")
    if (null != report.rcuiUrl)
        lines.push("**RCUI Storybook URL**: ${report.rcuiUrl}")
    if (null != report.publishUrl)
        lines.push("**Package URL**: ${report.publishUrl}")
    if (null != report.e2eUrl)
        lines.push("**E2E Report**: ${report.e2eUrl}")
    lines.push("**Note**: Feel free to submit [form](https://docs.google.com/forms/d/e/1FAIpQLSdBmVQZHgS1gYsSZQyLj3ecWgNSI5LdrRBDSd17xpO1eWU57g/viewform?usp=sf_link) if you have problems.")
    return lines.join(' \n')
}

def formatJenkinsReport(report) {
    List lines = []
    if (null != report.description)
        lines.push("Description: ${report.description}")
    if (null != report.saReport)
        lines.push("Static Analysis: ${report.saReport}")
    if (null != report.coverageDiff)
        lines.push("Coverage Changes: ${report.coverageDiff}")
    if (null != report.appUrl)
        lines.push("Application URL: ${urlToATag(report.appUrl)}")
    if (null != report.juiUrl)
        lines.push("Storybook URL: ${urlToATag(report.juiUrl)}")
    if (null != report.rcuiUrl)
        lines.push("RCUI Storybook URL: ${urlToATag(report.rcuiUrl)}")
    if (null != report.publishUrl)
        lines.push("Package URL: ${urlToATag(report.publishUrl)}")
    if (null != report.e2eUrl)
        lines.push("E2E Report: ${urlToATag(report.e2eUrl)}")
    return lines.join('<br>')
}

// glip channel
def reportChannels = [
    getMessageChannel(gitlabSourceBranch, gitlabTargetBranch)
]
// send report to owner if gitlabUserEmail is provided
if (gitlabUserEmail) {
    reportChannels.push(gitlabUserEmail)
    reportChannels.push(gitlabUserEmail.replaceAll('ringcentral.com', 'ringcentral.glip.com'))
}


// report
Map report = [:]
report.buildUrl = buildUrl

// start to build
skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'pending')
cancelOldBuildOfSameCause()

node(buildNode) {
    skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'running')

    // install nodejs tool and update environment variables
    env.NODEJS_HOME = tool nodejsTool
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
    env.TZ='UTC-8'
    env.NODE_ENV='development'
    env.SENTRYCLI_CDNURL='https://cdn.npm.taobao.org/dist/sentry-cli'

    try {

        stage ('Checkout') {

            // check if app or jui has been built
            sshagent(credentials: [deployCredentialId]) {
                // we should always build release version
                skipBuildApp = doesRemoteDirectoryExist(deployUri, appHeadShaDir)
                skipBuildJui = doesRemoteDirectoryExist(deployUri, juiHeadShaDir)
                skipBuildRcui = doesRemoteDirectoryExist(deployUri, rcuiHeadShaDir)
            }

            // since SA and UT must be passed before we build and deploy app and jui
            // that means if app and jui have already been built,
            // SA and UT must have already passed, we can just skip them to save more resources
            skipSaAndUt = skipBuildApp && skipBuildJui && (integrationBranch != gitlabSourceBranch)

            // we should always rebuild release version
            skipBuildApp = skipBuildApp && !buildRelease

            // we can even skip install dependencies
            skipInstallDependencies = skipSaAndUt && skipBuildRcui

            // don't skip e2e if configuration file exists
            skipEndToEnd = skipEndToEnd && !fileExists("tests/e2e/testcafe/configs/${gitlabSourceBranch}.json")

            // add the email of merge request related authors
            if (isMerge) {
                try {
                    String getAuthorsCmd = "git rev-list '${gitlabTargetNamespace}/${gitlabTargetBranch}'..'${gitlabSourceNamespace}/${gitlabSourceBranch}' | xargs git show -s --format='%ae' | sort | uniq | grep -E -o '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}\\b'".toString()
                    String[] authorsAddresses = sh(returnStdout: true, script:getAuthorsCmd).trim().split('\n')
                    String[] glipAddresses = authorsAddresses.collect{ it.replaceAll('ringcentral.com', 'ringcentral.glip.com')}
                    reportChannels.addAll(Arrays.asList(glipAddresses))
                } catch(e) {}
            }
        }

        parallel (
            'Unit Test': {
                report.coverage = 'skip'
                condStage(name: 'Unit Test', enable: !skipSaAndUt) {
                    sh 'npm run test -- --coverage -w 4'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage',
                        reportTitles: 'Coverage'
                    ])
                    report.coverage = "${buildUrl}Coverage"
                    // this is a work around
                    if (!fileExists('coverage/coverage-summary.json')) {
                        sh 'echo "{}" > coverage/coverage-summary.json'
                    }
                    if (!isMerge && integrationBranch == gitlabTargetBranch) {
                        // attach coverage report as git note when new commits are pushed to integration branch
                        // push git notes to remote
                        sshagent (credentials: [scmCredentialId]) {
                            sh "git fetch -f ${gitlabSourceNamespace} refs/notes/*:refs/notes/*"
                            sh "git notes add -f -F coverage/coverage-summary.json ${appHeadSha}"
                            sh "git push -f ${gitlabSourceNamespace} refs/notes/* --no-verify"
                        }
                    }
                    if (isMerge && integrationBranch == gitlabTargetBranch && fileExists('scripts/coverage-diff.js')) {
                        // compare coverage report with integration branch's
                        // step 1: fetch git notes
                        sshagent (credentials: [scmCredentialId]) {
                            sh "git fetch -f ${gitlabTargetNamespace} ${gitlabTargetBranch}"
                            sh "git fetch -f ${gitlabTargetNamespace} refs/notes/*:refs/notes/*"
                        }
                        // step 2: get latest commit on integration branch with notes
                        sh "git rev-list ${gitlabTargetNamespace}/${gitlabTargetBranch} > commit-sha.txt"
                        sh "git notes | cut -d ' ' -f 2 > note-sha.txt"
                        String latestCommitWithNote = sh(returnStdout: true, script: "grep -Fx -f note-sha.txt commit-sha.txt | head -1").trim()
                        // step 3: compare with baseline
                        if (latestCommitWithNote) {
                            // read baseline
                            sh "git notes show ${latestCommitWithNote} > baseline-coverage-summary.json"
                            // archive detail
                            try {
                                sh "npx ts-node scripts/report-diff.ts baseline-coverage-summary.json coverage/coverage-summary.json > coverage-diff.csv"
                                archiveArtifacts artifacts: 'coverage-diff.csv', fingerprint: true
                                report.coverageDiffDetail = "${buildUrl}artifact/coverage-diff.csv"
                            } catch (e) {}
                            // ensure increasing
                            int exitCode = sh(
                                returnStatus: true,
                                script: "node scripts/coverage-diff.js baseline-coverage-summary.json coverage/coverage-summary.json > coverage-diff",
                            )
                            report.coverageDiff = exitCode ? FAILURE_EMOJI : SUCCESS_EMOJI;
                            report.coverageDiff += sh(returnStdout: true, script: 'cat coverage-diff').trim()
                            if (exitCode > 0) {
                                sh 'echo "coverage drop!" && false'
                            }
                        }
                    }
                }
            }
        )

        parallel (
            'Build JUI' : {
                condStage(name: 'Build JUI', enable: !skipBuildJui) {
                    withEnv(["NODE_OPTIONS=--max_old_space_size=12000"]) {
                        sh 'npm run build:ui'
                    }
                }

                condStage(name: 'Deploy JUI') {
                    String sourceDir = "packages/jui/storybook-static/"  // !!! don't forget trailing '/'
                    sshagent(credentials: [deployCredentialId]) {
                        // copy to dir name with head sha when dir is not exists
                        skipBuildJui || rsyncFolderToRemote(sourceDir, deployUri, juiHeadShaDir)
                        // and create copy to branch name based folder
                        updateRemoteCopy(deployUri, juiHeadShaDir, juiLinkDir)
                    }
                }
                report.juiUrl = juiUrl
            },

            'Build RCUI' : {
                condStage(name: 'Build RCUI', enable: !skipBuildRcui) {
                    withEnv(["NODE_OPTIONS=--max_old_space_size=12000"]) {
                        dir('packages/rcui') {
                            sh 'npm run build:storybook'
                        }
                    }
                }

                condStage(name: 'Deploy RCUI') {
                    String sourceDir = "packages/rcui/public/"  // !!! don't forget trailing '/'
                    sshagent(credentials: [deployCredentialId]) {
                        // copy to dir name with head sha when dir is not exists
                        skipBuildRcui || rsyncFolderToRemote(sourceDir, deployUri, rcuiHeadShaDir)
                        // and create copy to branch name based folder
                        updateRemoteCopy(deployUri, rcuiHeadShaDir, rcuiLinkDir)
                    }
                }
                report.rcuiUrl = rcuiUrl
            },

            'Build Application': {
                condStage(name: 'Build Application', enable: !skipBuildApp) {
                    // FIXME: move this part to build script
                    sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
                    sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
                    try {
                        // fix FIJI-4534
                        long timestamp = System.currentTimeMillis()
                        sh "sed 's/{{buildCommit}}/${headSha.substring(0, 9)}/;s/{{buildTime}}/${timestamp}/' application/src/containers/VersionInfo/versionInfo.json > versionInfo.json"
                        sh 'mv versionInfo.json application/src/containers/VersionInfo/versionInfo.json'
                    } catch (e) {}
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
                    sshagent(credentials: [deployCredentialId]) {
                        // copy to dir name with head sha when dir is not exists
                        skipBuildApp || rsyncFolderToRemote(sourceDir, deployUri, appHeadShaDir)

                        long ts = System.currentTimeMillis()
                        // and update precache revision
                        updatePrecacheRevision(deployUri, appHeadShaDir, headSha, ts)

                        // and create copy to branch name based folder, for release build, use replace instead of delete
                        updateRemoteCopy(deployUri, appHeadShaDir, appLinkDir, !buildRelease)

                        // and update version info

                        updateVersionInfo(deployUri, appLinkDir, headSha, ts)
                        // for stage build, also create link to stage folder
                        if (!isMerge && gitlabSourceBranch.startsWith('stage'))
                            updateRemoteCopy(deployUri, appHeadShaDir, appStageLinkDir)
                    }
                }
                report.appUrl = appUrl
                safeMail(reportChannels, "Build Success: ${appUrl}", "Build Success: ${appUrl}")
            }
        )

        condStage(name: 'Telephony Automation', timeout: 600) {
            try {
                if (!isMerge && 'POC/FIJI-1302' == gitlabSourceBranch) {
                    build(job: 'Jupiter-telephony-automation', wait: false, parameters: [
                        [$class: 'StringParameterValue', name: 'BRANCH', value: 'POC/FIJI-1302'],
                        [$class: 'StringParameterValue', name: 'JUPITER_URL', value: appUrl],
                    ])
                }
            } catch (e) {}
        }

        condStage (name: 'E2E Automation', timeout: 900, enable: !skipEndToEnd) {
            String hostname =  sh(returnStdout: true, script: 'hostname -f').trim()
            String startTime = sh(returnStdout: true, script: "TZ=UTC-8 date +'%F %T'").trim()
            withEnv([
                "HOST_NAME=${hostname}",
                "SITE_URL=${appUrl}",
                "SITE_ENV=${e2eSiteEnv}",
                "SELENIUM_SERVER=${e2eSeleniumServer}",
                "ENABLE_REMOTE_DASHBOARD=${e2eEnableRemoteDashboard}",
                "ENABLE_MOCK_SERVER=${e2eEnableMockServer}",
                "BROWSERS=${e2eBrowsers}",
                "CONCURRENCY=${e2eConcurrency}",
                "EXCLUDE_TAGS=${e2eExcludeTags}",
                "BRANCH=${gitlabSourceBranch}",
                "ACTION=ON_MERGE",
                "SCREENSHOTS_PATH=./screenshots",
                "TMPFILE_PATH=./tmp",
                "DEBUG_MODE=false",
                "STOP_ON_FIRST_FAIL=true",
                "SKIP_JS_ERROR=true",
                "SKIP_CONSOLE_ERROR=true",
                "SKIP_CONSOLE_WARN=true",
                "SCREENSHOT_WEBP_QUALITY=80",
                "QUARANTINE_MODE=true",
                "QUARANTINE_FAILED_THRESHOLD=4",
                "QUARANTINE_PASSED_THRESHOLD=1",
                "DEBUG=axios",
                "ENABLE_SSL=true",
                //"FIXTURES=./fixtures/**/*.ts,./telephony/**/*.ts",
                "RUN_NAME=[Jupiter][Pipeline][Merge][${startTime}][${gitlabSourceBranch}][${gitlabMergeRequestLastCommit}]",
            ]) {dir("tests/e2e/testcafe") {
                // print environment variable to help debug
                sh 'env'
                // following configuration file is use for tuning chrome, in order to use use-data-dir and disk-cache-dir
                // you need to ensure target dirs exist in selenium-node, and use ramdisk for better performance
                writeFile file: 'capabilities.json', text: params.E2E_CAPABILITIES, encoding: 'utf-8'
                sh "mkdir -p screenshots tmp"
                sh "echo 'registry=${npmRegistry}' > .npmrc"
                sshagent (credentials: [scmCredentialId]) {
                    sh 'npm install --unsafe-perm'
                }

                if (e2eEnableRemoteDashboard){
                    sh 'npx ts-node create-run-id.ts'
                    report.e2eUrl = sh(returnStdout: true, script: 'cat reportUrl || true').trim()
                } else {
                    report.e2eUrl = 'beat dashboard is disabled'
                }
                withCredentials([usernamePassword(
                    credentialsId: rcCredentialId,
                    usernameVariable: 'RC_PLATFORM_APP_KEY',
                    passwordVariable: 'RC_PLATFORM_APP_SECRET')]) {
                    try {
                        sh "npm run e2e"
                    } finally {
                        if (!e2eEnableRemoteDashboard) {
                            sh "tar -czvf allure.tar.gz -C ./allure/allure-results . || true"
                            archiveArtifacts artifacts: 'allure.tar.gz', fingerprint: true
                        }
                        // TODO: else: close beat report properly
                    }
                }
            }}
        }
        // post success actions
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'success')
        report.description = currentBuild.getDescription()
        report.jobUrl = buildUrl
        report.buildResult = "${SUCCESS_EMOJI} Success"
        currentBuild.setDescription(formatJenkinsReport(report))
        safeMail(reportChannels, "Jenkins Pipeline Success: ${currentBuild.fullDisplayName}", formatGlipReport(report))
    } catch (e) {
        // post failure actions
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'failed')
        report.description = currentBuild.getDescription()
        report.jobUrl = buildUrl
        report.buildResult = "${FAILURE_EMOJI} Failure"
        if (e in InterruptedException)
            report.buildResult = "${ABORTED_EMOJI} Aborted"
        currentBuild.setDescription(formatJenkinsReport(report))
        safeMail(reportChannels, "Jenkins Pipeline Stop: ${currentBuild.fullDisplayName}", formatGlipReport(report))
        throw e
    }
}
