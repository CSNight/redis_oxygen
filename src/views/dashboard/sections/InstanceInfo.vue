<template>
    <el-card class="chart-panel">
        <div slot="header" style="position: relative">
            <i class="fa fa-codepen"></i>
            <h3>Information</h3>
            <el-button size="mini" style="background: transparent;right:10px;position: absolute;border: none"
                       type="danger"
                       icon="el-icon-refresh" @click="refreshInfo"></el-button>
        </div>
        <ul class="ins-info">
            <li>
                <div>
                    <fa-icon icon-class="fa-server"/>
                    实例名称
                </div>
                <div class="info-right">{{target.instance_name}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-calendar-alt"/>
                    创建时间
                </div>
                <div class="info-right">{{dateFormat("YYYY-mm-dd HH:MM:SS",target.ct)}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-link"/>
                    连接状态
                </div>
                <div class="info-right">
                    <el-tag size="mini" :type="target.state ? 'success' : 'danger'">{{target.state?'在线':'断开'}}</el-tag>
                </div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-stopwatch"/>
                    运行时长
                </div>
                <div class="info-right">{{parseTime(target.uptime_in_seconds)}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-microsoft"/>
                    操作系统
                </div>
                <div class="info-right">{{target.os.split(" ")[0]}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-game-board-alt"/>
                    系统架构
                </div>
                <div class="info-right">{{'x'+target.arch_bits}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-bring-front"/>
                    版本号
                </div>
                <div class="info-right">{{target.version}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-sitemap"/>
                    逻辑库
                </div>
                <div class="info-right">{{target.dbCount}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-chart-network"/>
                    运行模式
                </div>
                <div class="info-right">{{target.type.toUpperCase()}}</div>
            </li>
            <li>
                <div>
                    <fa-icon icon-class="fa-critical-role"/>
                    实例角色
                </div>
                <div class="info-right">{{target.role.toUpperCase()}}</div>
            </li>
        </ul>
    </el-card>
</template>

<script>
    import {dateFormat, parseSec} from "@/utils/utils";
    import {getByIns} from "@/api/redismanage/redis_dba";
    import {refreshMeta} from "@/api/redismanage/redis_ins";

    export default {
        name: "InstanceInfo",
        props: {
            ins: {
                type: String,
                defaultValue: '',
                required: true
            }
        },
        data() {
            return {
                target: {
                    ct: null,
                    arch_bits: 64,
                    dbCount: 0,
                    instance_name: "",
                    node_type: "ins",
                    os: "",
                    role: "",
                    state: false,
                    type: "",
                    uptime_in_seconds: 0,
                    version: ""
                },
            }
        },
        watch: {
            ins: function () {
                this.getInstanceInfo();
            }
        },
        methods: {
            parseTime(sec) {
                return parseSec(sec);
            }, dateFormat(fmt, dt) {
                if (dt === null) {
                    return '';
                } else {
                    return dateFormat(fmt, new Date(dt));
                }
            }, getInstanceInfo() {
                if (!this.ins || this.ins === '') {
                    return;
                }
                getByIns(this.ins).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.target = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "刷新出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "刷新出错!" + resp.data.message
                    });
                })
            }, refreshInfo() {
                refreshMeta(this.ins).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.target = Object.assign(this.target, resp.data.message)
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '刷新失败:' + resp.data.message
                        });
                    }
                    this.loadData();
                }).catch(() => {
                    this.loadData();
                    this.$message.error({
                        message: "刷新错误"
                    });
                })
            }
        }
    }
</script>

<style lang="scss" scoped>

    /deep/ .el-card__body {
        padding: 0 10px;
    }

    /deep/ .el-tag {
        background: transparent;
    }



    .ins-info {
        padding-left: 0;
        list-style: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;

        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 50%;
            border-bottom: 1px solid #2b3553;
            padding: 11px 10px;
            font-size: 13px;
            color: #00eaff;
            height: 40px;

            i {
                text-align: center;
                color: #00eaff;
            }
        }

        .info-right {
            a {
                color: #317EF3;
                margin-right: 5px;
            }
        }
    }
</style>