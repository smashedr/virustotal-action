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
            core.setFailed(`Release Not Found: ${releaseTag}`)
            return
        }
        let body = release.data.body
        console.log('release.data.body:', body)

        const testData = [
            {
                name: 'hls_video_downloader-chrome.crx',
                link: 'https://www.virustotal.com/gui/file/3a012ae8458cd74b01eb483661b6076de27a83b219d690a929039e7e7cbb450e',
            },
            {
                name: 'hls_video_downloader-chrome.crx',
                link: 'https://www.virustotal.com/gui/file/e1f59774d3536dcbb05e1a31dd0fdc49ab093acf97068f8659a41422c4776e30',
            },
        ]

        body = body.concat('\n\n**VirusTotal Results:**')
        for (const td of testData) {
            body = body.concat(`\n[${td.name}](${td.link})`)
        }
        console.log('body:', body)

        await octokit.rest.repos.updateRelease({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: release.data.id,
            body: body,
        })

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
