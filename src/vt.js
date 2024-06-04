const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

export async function vtUpload(fileName, apiKey) {
    const filePath = path.resolve(__dirname, fileName)
    console.log('filePath:', filePath)

    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))

    const response = await axios.post(
        'https://www.virustotal.com/api/v3/files',
        form,
        {
            headers: {
                'x-apikey': apiKey,
                ...form.getHeaders(),
            },
        }
    )
    console.log('response:', response)
    console.log('response.data.data.id:', response.data.data.id)
    return response.data
}

export async function vtLink(id, apiKey) {
    // Retrieve the analysis report using the analysis ID
    const response = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${id}`,
        {
            headers: {
                'x-apikey': apiKey,
            },
        }
    )

    const sha256Hash = response.data.meta.file_info.sha256
    console.log('sha256Hash:', sha256Hash)

    const link = `https://www.virustotal.com/gui/file/${sha256Hash}`
    console.log('link:', link)
    return link
}
