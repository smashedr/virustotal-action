const core = require('@actions/core')
const github = require('@actions/github')

;(async () => {
    try {
        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        // console.log('github.context.payload', github.context.payload)

        console.log('github.context', github.context)

        const testInput = core.getInput('test_input')
        console.log('testInput', testInput)

        const githubToken = core.getInput('github_token')
        console.log('githubToken', githubToken)

        const octokit = github.getOctokit(githubToken)
        console.log('octokit', octokit)

        console.log('github.context.ref', github.context.ref)
        const ref = '0.1.12'
        console.log('using test value:', '0.1.12')
        const release = await octokit.rest.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            ref,
        })
        console.log('release', release)

        const assets = await octokit.rest.repos.listReleaseAssets({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release,
        })
        console.log('assets', assets)

        // core.setOutput("time", time);
    } catch (error) {
        console.warn(error)
        core.setFailed(error.message)
    }
})()
