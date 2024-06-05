import { downloadAsset, vtUpload, vtLink } from './vt.js'

const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const path = require('path')

;(async () => {
    try {
        // console.log('github.context', github.context)
        if (github.context.eventName !== 'release') {
            console.log('Skipping non-release:', github.context.eventName)
            // return
        }

        const vtApiKey = core.getInput('vt_api_key')
        console.log('vtApiKey:', vtApiKey)
        const githubToken = core.getInput('github_token')
        console.log('githubToken:', githubToken)

        const octokit = github.getOctokit(githubToken)
        // console.log('octokit:', octokit)

        const tag = github.context.ref.replace('refs/tags/', '')
        console.log('tag:', tag)
        const testTag = '0.1.12'
        console.log('testTag:', testTag)

        const releaseTag = await octokit.rest.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: testTag,
        })
        console.log('release.data.id:', release.data.id)
        const release = await octokit.rest.repos.getRelease({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: releaseTag.data.id,
        })
        console.log('release:', release)
        if (!release?.data) {
            console.log('Release Not Found:', release)
            core.setFailed(`Release Not Found: ${tag}`)
            return
        }
        console.log('release.body:', release.body)

        // const assets = await octokit.rest.repos.listReleaseAssets({
        //     owner: github.context.repo.owner,
        //     repo: github.context.repo.repo,
        //     release_id: release.data.id,
        // })
        // // console.log('assets:', assets)
        // if (!assets.data?.length) {
        //     console.log('No Assets Found:', assets)
        //     core.setFailed('No Assets Found')
        //     return
        // }
        //
        // const assetsPath = path.join(__dirname, 'assets')
        // console.log('assetsPath:', assetsPath)
        //
        // // Create the 'assets' directory if it doesn't exist
        // if (!fs.existsSync(assetsPath)) {
        //     console.log('mkdirSync:', assetsPath)
        //     fs.mkdirSync(assetsPath)
        // }
        //
        // const results = []
        // for (const asset of assets.data) {
        //     console.log(`name: ${asset.name}`)
        //     const filePath = await downloadAsset(asset)
        //     console.log('filePath:', filePath)
        //     const response = await vtUpload(filePath, vtApiKey)
        //     const link = await vtLink(response.data.id, vtApiKey)
        //     console.log('link:', link)
        //     const data = {
        //         name: asset.name,
        //         link: link,
        //     }
        //     results.push(data)
        // }
        // console.log('results:', results)

        // core.setOutput("time", time);
    } catch (error) {
        console.log(error)
        core.setFailed(error.message)
    }
})()
