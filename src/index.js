import { downloadAsset, vtUpload } from './vt.js'

const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const path = require('path')
// const crypto = require('crypto')

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
        const updateRelease = core.getInput('update_release')
        console.log('updateRelease:', updateRelease)
        console.log('typeof:', typeof updateRelease)

        const octokit = github.getOctokit(githubToken)
        // console.log('octokit:', octokit)

        // const releaseTag = github.context.ref.replace('refs/tags/', '')
        // console.log('releaseTag:', releaseTag)
        const releaseTag = '0.1.12'
        console.log('releaseTag:', releaseTag)

        const release = await octokit.rest.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: releaseTag,
        })
        // console.log('release:', release)
        if (!release?.data) {
            console.log('Release Not Found:', release)
            core.setFailed(`Release Not Found: ${releaseTag}`)
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
            core.setFailed('No Assets Found')
            return
        }

        console.log('process.env:', process.env)
        const tempDir = process.env.RUNNER_TEMP
        console.log('tempDir:', tempDir)

        const assetsPath = path.join(__dirname, 'assets')
        console.log('assetsPath:', assetsPath)

        // Create the 'assets' directory if it doesn't exist
        if (!fs.existsSync(assetsPath)) {
            console.log('mkdirSync:', assetsPath)
            fs.mkdirSync(assetsPath)
        }

        const results = []
        for (const asset of assets.data) {
            console.log(`name: ${asset.name}`)
            const filePath = await downloadAsset(asset)
            console.log('filePath:', filePath)
            const response = await vtUpload(filePath, vtApiKey)
            console.log('response.data.id:', response.data.id)
            const link = `https://www.virustotal.com/gui/file-analysis/${response.data.id}`
            console.log('link:', link)
            const data = {
                name: asset.name,
                link: link,
            }
            results.push(data)
        }
        console.log('results:', results)

        let body = release.data.body
        console.log('release.data.body:', body)

        body = body.concat('\n\n**VirusTotal Results:**')
        for (const result of results) {
            const parts = result.link.split('/')
            const hash = parts[parts.length - 1]
            body = body.concat(`\n- ${result.name} [${hash}](${result.link})`)
        }
        console.log('body:', body)

        await octokit.rest.repos.updateRelease({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: release.data.id,
            body: body,
        })

        // core.setOutput("time", time);
    } catch (error) {
        console.log(error)
        core.setFailed(error.message)
    }
})()
