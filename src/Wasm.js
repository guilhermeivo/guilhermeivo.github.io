import { float, sizeof } from "./types.js"

export default class Wasm {
    constructor() { 
        this.memory = []
        this.exports = null

        this.local = {
            offset: 0
        }

        this.fd_close = this.fd_close.bind(this)
        this.fd_fdstat_get = this.fd_fdstat_get.bind(this)
        this.fd_seek = this.fd_seek.bind(this)
        this.fd_write = this.fd_write.bind(this)
        this.proc_exit = this.proc_exit.bind(this)
        this.environ_get = this.environ_get.bind(this)
        this.environ_sizes_get = this.environ_sizes_get.bind(this)
        this.fd_prestat_get = this.fd_prestat_get.bind(this)
        this.fd_prestat_dir_name = this.fd_prestat_dir_name.bind(this)
        this.fd_read = this.fd_read.bind(this)
        this.args_get = this.args_get.bind(this)
        this.args_sizes_get = this.args_sizes_get.bind(this)
    }

    fd_close() { 
        console.log("fd_close") 
    }
    
    fd_fdstat_get(fd) { 
        if (fd < 1 || fd > 2) {
            throw "Unsupported file descriptor"
        }
    }

    fd_seek() { 
        console.log("fd_seek") 
    }
    
    fd_write(fd, iovsPtr, iovsLength, bytesWrittenPtr) {
        const iovs = new Uint32Array(this.memory, iovsPtr, iovsLength * 2)

        let log = console.log
        if (fd === 1) { // stdout
            log = console.log 
        } else if (fd === 2) { // stderr
            log = console.error
        } else {
            throw "Unsupported file descriptor"
        }

        let text = ""
        let totalBytesWritten = 0
        const decoder = new TextDecoder()
        for (let i = 0; i < iovsLength * 2; i += 2) {
            const offset = iovs[i]
            const length = iovs[i+1]
            const textChunk = decoder.decode(new Int8Array(this.memory, offset, length))
            text += textChunk
            totalBytesWritten += length
        }
        const dataView = new DataView(this.memory)
        dataView.setInt32(bytesWrittenPtr, totalBytesWritten, true)

        if (text == "\n" || text == "\0") return 0;

        const bold = "font-weight: bold";
        const normal = "font-weight: normal";

        if (text.includes("\n")) {
            console.group("%cwasm%c", bold, normal)
            log(text)
            console.groupEnd()
        } else {
            log(`%cwasm:%c ${text}`, bold, normal)
        }
        

        return 0
    }

    proc_exit() { 
        return 0;
    }

    environ_get() {
        return 0;
    }

    environ_sizes_get() {
        return 0;
    }

    fd_prestat_get() {
        return 0;
    }

    fd_prestat_dir_name() {
        return 0;
    }

    fd_read() {
        return 0;
    }

    args_get() {

    }
    
    args_sizes_get() {

    }

    importObject(my_object) {
        return {
            "wasi_snapshot_preview1": {
                fd_close: this.fd_close,
                fd_fdstat_get: this.fd_fdstat_get,
                fd_seek: this.fd_seek,
                fd_write: this.fd_write,
                proc_exit: this.proc_exit,
                environ_get: this.environ_get,
                environ_sizes_get: this.environ_sizes_get,
                fd_prestat_get: this.fd_prestat_get,
                fd_prestat_dir_name: this.fd_prestat_dir_name,
                fd_read: this.fd_read,
                args_get: this.args_get,
                args_sizes_get: this.args_sizes_get
            },
            ...my_object
        }
    }

    create(type, data) {
        const length = data.length
        const value = new type(this.memory, this.local.offset, length)
        value.set(data)
        this.local.offset += length * sizeof(type)
        return value
    }

    update(value, data) {
        const length = Math.max(value.length, data.length)
        for (let i = 0; i < length; i++) {
            value[i] = data[i]
        }
    }
}