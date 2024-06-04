import { vtLink, vtUpload } from './vt.js'

const core = require('@actions/core')
const github = require('@actions/github')

const fs = require('fs')
const path = require('path')

;(async () => {
    try {
        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        // console.log('github.context.payload', github.context.payload)

        // console.log('github.context', github.context)

        if (github.context.eventName !== 'release') {
            console.log('Not a release:', github.context.eventName)
            // return
        }

        const vtApiKey = core.getInput('vt_api_key')
        console.log('vtApiKey:', vtApiKey)

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
        if (!release?.data) {
            console.log('Release Not Found:', release)
            return
        }

        const assets = await octokit.rest.repos.listReleaseAssets({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: release.data.id,
        })
        // console.log('assets:', assets)
        if (!assets.data?.length) {
            console.log('No Assets Found:', assets)
            return
        }

        // const links = getAssetsLinks(assets.data)
        // console.log('links:', links)

        const assetsPath = path.join(__dirname, 'assets')
        console.log('path:', assetsPath)

        // Create the 'assets' directory if it doesn't exist
        if (!fs.existsSync(assetsPath)) {
            fs.mkdirSync(assetsPath)
        }

        for (const asset of assets) {
            console.log(`Downloading: ${asset.name}`)
            const filePath = path.join(assetsPath, asset.name)
            const assetResponse = await fetch(asset.browser_download_url)
            const fileStream = fs.createWriteStream(filePath)
            assetResponse.body.pipe(fileStream)
        }

        const files = await fs.promises.readdir(assetsPath)
        console.log('files:', files)

        console.log('vtLink:', vtLink)
        console.log('vtUpload:', vtUpload)

        // core.setOutput("time", time);
    } catch (error) {
        console.log(error)
        core.setFailed(error.message)
    }
})()

// /**
//  * @function getAssetsLinks
//  * @param {Object} assets
//  * @return {Array[String]}
//  */
// function getAssetsLinks(assets) {
//     // console.log('assets:', assets)
//     const links = []
//     assets.forEach((asset) => {
//         // console.log('asset:', asset)
//         links.push(asset.browser_download_url)
//     })
//     return links
// }
