import { spawnSync } from 'child_process'
import {copySync} from "fs-extra/esm"
/**
 * 执行获取改动文件的git 命令
 * @param {*} uname
 * @returns
 */
function exeFile(uname) {
    const result = spawnSync(
        'git',
        [
            'log',
            '--name-status',
            // '--pretty=format:"[commit]%cd"',
            `--author="${uname}"`,
        ],
        { encoding: 'utf-8', shell: true },
    )
    return result.stdout
}
/**
 * 解析改动文件，并且打包
 * @param {*} logs
 */
function parseFile(logs) {
    const files = []
    logs.forEach((l) => {
        if (l.startsWith('A\t')) {
            files.push(l.replace('A', '').trim())
        }
    })
    console.log('改动文件：', files)
}

function exePatch(uname) {
    const result = spawnSync(
        'git',
        [
            'log',
            '-p',
            // '--name-status',
            // '--pretty=format:"[commit]%cd"',
            `--author="${uname}"`,
        ],
        { encoding: 'utf-8', shell: true },
    )
    return result.stdout
}
/**
 * 解析改动差异
 * @param {*} logs
 */
function parsePatch(logs) {
    console.log('直接写入文件',logs)
}
/**
 * 按时间范围过滤log
 */
function datePick(since, until, logs) {
    const start = new Date(since)
    const end = new Date(until)
    // console.log(`筛选从${start}到${end}范围的提交记录`)
    const lines = logs.split(/\r?\n/).filter((line) => line.trim() !== '')
    // console.log(logs,lines)
    const result = []
    let isCommiting = false
    let commitArr = []
    lines.forEach((line) => {
        if (line.startsWith('commit')) {
            isCommiting = true
            if (commitArr.length) {
                result.push(...commitArr)
                commitArr = []
            }
        }
        if (line.startsWith('Date')) {
            const dateStr = line.replace('Date:', '').trim()
            const dateTime = new Date(dateStr)
            // console.log(start, dateStr, dateTime, end)
            if (dateTime <= end && dateTime >= start) {
                // console.log('时间在时间段')
            } else {
                isCommiting = false
                commitArr = []
            }
        }
        if (isCommiting) {
            commitArr.push(line)
        }
    })
    // console.log('提交记录过滤完成：', result)
    return result
}

/**
 *
 * @param {*} since
 * @param {*} until
 */
export default function (since, until, name) {
    const fileLogs = datePick(since, until, exeFile(name))
    parseFile(fileLogs)
    const patchLogs = datePick(since, until, exePatch(name))
    parsePatch(patchLogs)
}

/**
 *
 * git log -p --author="sss"
 *
 * git log --author="" --name-status
 *
 * --pretty=format:"%cd"
 * git log --name-status --pretty=format:"[commit]%cd"
 */
