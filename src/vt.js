const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

export async function downloadAsset(asset, assetsDir = 'assets') {
    // console.log('asset:', asset)
    // console.log('assetsDir:', assetsDir)

    const filePath = path.join(__dirname, assetsDir, asset.name)
    console.log('filePath:', filePath)

    const response = await axios({
        method: 'GET',
        url: asset.browser_download_url,
        responseType: 'stream',
    })
    // console.log('response:', response)

    const writer = fs.createWriteStream(filePath)
    // console.log('writer:', writer)
    response.data.pipe(writer)

    await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })

    console.log('wrote:', filePath)
    return filePath
}

export async function vtUpload(filePath, apiKey) {
    console.log('vtUpload:', filePath)
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))
    const url = await vtUploadUrl(filePath, apiKey)
    console.log('url:', url)
    const response = await axios.post(url, form, {
        headers: {
            'x-apikey': apiKey,
            ...form.getHeaders(),
        },
    })
    // console.log('response:', response)
    console.log('response.data.data.id:', response.data.data.id)
    return response.data
}

export async function vtHash(id, apiKey) {
    console.log('vtHash: id:', id)
    const response = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${id}`,
        {
            headers: {
                'x-apikey': apiKey,
            },
        }
    )
    console.log('response.data:', response.data)
    const info = response.data.meta.file_info
    console.log('response.data.meta.file_info:', info)

    const hash = info.md5 || info.sha1 || info.sha256
    console.log('hash:', hash)
    return hash
}

async function vtUploadUrl(filePath, apiKey) {
    const stats = fs.statSync(filePath)
    console.log('stats.size:', stats.size)
    if (stats.size < 32000000) {
        return 'https://www.virustotal.com/api/v3/files'
    }

    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'x-apikey': apiKey },
    }

    const response = await fetch(
        'https://www.virustotal.com/api/v3/files/upload_url',
        options
    )
    // console.log('response:', response)
    const data = await response.json()
    // console.log('data:', data)
    return data.data
}
