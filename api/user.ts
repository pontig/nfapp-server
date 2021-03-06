import { Router } from 'express'
import { aw, pool, login } from './util'

let user = Router()

user.get('/info/:username', aw(async (req) => {
    let client = await pool.connect()
    let result = await client.query({
        text: 'SELECT firstname, lastname, class, role, profilepic FROM users WHERE username=$1',
        values: [req.params.username]
    })
    client.release()
    return {
        success: true,
        data: {
            firstName: result.rows[0].firstname,
            lastName: result.rows[0].lastname,
            classname: result.rows[0].class,
            role: result.rows[0].role,
            profilepic: result.rows[0].profilepic ?? undefined
        }
    }
}))

user.post('/profilepic', aw(async (req) => {
    const logged = await login(req.header('x-nfapp-username'), req.header('x-nfapp-password'))
    if (!logged) return { success: false, error: 'invalid credentials' }
    if (!req.body.profilepic) return { success: false, error: 'a profilepic must be provided' }
    let client = await pool.connect()
    await client.query({
        text: 'UPDATE users SET profilepic=$1 WHERE username=$2',
        values: [req.body.profilepic, req.header('x-nfapp-username')]
    })
    client.release()
    return { success: true }
}))


export default user