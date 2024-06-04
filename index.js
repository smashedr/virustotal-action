const core = require('@actions/core')
const github = require('@actions/github')

;(async () => {
    try {
        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        // console.log('github.context.payload', github.context.payload)

        // console.log('github.context', github.context)

        console.log('github.context.eventName:', github.context.eventName)
        if (github.context.eventName !== 'release') {
            console.log('Not a release:', github.context.eventName)
            // return
        }

        const testInput = core.getInput('test_input')
        console.log('testInput:', testInput)

        const githubToken = core.getInput('github_token')
        console.log('githubToken:', githubToken)

        const octokit = github.getOctokit(githubToken)
        // console.log('octokit:', octokit)

        const releaseTag = github.context.ref.replace('refs/tags/', '')
        console.log('releaseTag:', releaseTag)
        const testTag = '0.1.12'
        console.log('testTag:', testTag)
        const release = await octokit.rest.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: testTag,
        })
        // console.log('release:', release)

        const assets = await octokit.rest.repos.listReleaseAssets({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: release.data.id,
        })
        // console.log('assets:', assets)

        const links = getAssetsLinks(assets.data)
        console.log('links:', links)

        // core.setOutput("time", time);
    } catch (error) {
        console.log(error)
        core.setFailed(error.message)
    }
})()

/**
 * @function getAssetsLinks
 * @param {Object} assets
 * @return {Array[String]}
 */
function getAssetsLinks(assets) {
    console.log('assets:', assets)
    const links = []
    assets.forEach((asset) => {
        console.log('asset:', asset)
        links.push(asset.browser_download_url)
    })
    return links
}
