import { UploadStore } from './upload-store.mjs'
import { resize } from './resize.mjs'

import FormData from 'form-data'
import axios from 'axios'
import path from 'path'

export class Upload
{
    static dirname = path.dirname(process.argv[1])

    static size = { crop_x: 0, crop_y: 0, crop_x2: 1590, crop_y2: 530 }

    static api = 'https://api.vk.com/method'

    static server = 'photos.getOwnerCoverPhotoUploadServer'

    static save = 'photos.saveOwnerCoverPhoto'

    static ver = 5.131

    static getServers(list)
    {
        const cut = ({ access_token, group_id }) => ({ access_token, group_id }),
            { api, server, size, ver } = Upload

        return list.map(set => ({
            url: axios.get(`${api}/${server}`, { params: { ...cut(set), ...size, v: ver } }),
            ...set
        }))
    }

    static extract(promise)
    {
        return promise.then(s => 'response' in s.data ? s.data.response : s.data.error)
    }

    static fix(perform)
    {
        const { api, save, ver } = Upload

        return Promise.all(perform).then(results => {
            return results.filter(set => 'hash' in set).map(set => axios.get(`${api}/${save}`, { params: { ...set, v: ver } }))
        })
    }

    static upload(servers)
    {
        return servers.map(server => new Promise(async (resolve, reject) => {
            try {

                const { group_id, url, stream } = server,
                    { upload_url, error_msg } = await Upload.extract(url)

                if (upload_url) {
                    const fd = new FormData({})

                    fd.append('photo', resize(stream), { contentType: 'image/png', filename: 'img.png' })

                    const { data } = await axios.post(upload_url, fd, { headers: fd.getHeaders() })

                    delete server.stream
                    delete server.url

                    resolve({ ...server, ...data })
                } else {
                    reject({ group_id, error_msg })
                }

            } catch (e) {
                reject(e)
            }
        }))
    }

    static setup(promise)
    {
        return UploadStore.get(promise).then(Upload.getServers).then(Upload.upload).then(Upload.fix)//.catch(console.log)
    }

    static init()
    {
        return UploadStore.connect()
    }

    static close()
    {
        return UploadStore.close()
    }
}
