<template>
    <div class="landing">
        <LoginForm ref="form" :is-login="isLogin"/>
        <header class="container" style="position: relative">
            <div style="position:absolute;z-index: 100;display:flex;width: 100%;margin: 20px 0">
                <el-image style="height: 60px;width: 100px" :src="src" fit="contain"/>
                <el-menu
                        class="el-menu menu"
                        mode="horizontal"
                        background-color="#748EF4"
                        text-color="#fff"
                        active-text-color="#fff">
                    <el-menu-item index="1">首页</el-menu-item>
                    <el-menu-item index="2" v-if="name!==''">
                        <router-link to="/home">Dashboard</router-link>
                    </el-menu-item>
                    <el-menu-item index="3">
                        <a target="_blank" href="https://docs.csnight.xyz">帮助文档</a>
                    </el-menu-item>
                    <el-menu-item index="4" v-if="hasRole('ROLE_DEV')">
                        <a target="_blank" :href="baseUrl+'/swagger-ui.html'">服务接口</a>
                    </el-menu-item>
                </el-menu>
                <div style="margin: auto">
                    <el-button type="warning" size="medium" style="text-transform: uppercase" v-if="name!==''"
                               @click="signOut" v-html='"<i class=\"fa fa-sign-out\"></i> "+name'/>
                    <el-button type="primary" size="medium" icon="el-icon-user" v-if="name===''" @click="login"
                               v-html='"<i class=\"fa fa-sign-in\"></i> "+sign_in'/>
                    <el-button type="primary" size="medium" v-if="name===''" @click="register"
                               v-html='"<i class=\"fa fa-user-plus\"></i> "+sign_up'/>
                </div>
            </div>
        </header>
        <div>
            <section class="section-shaped my-0">
                <div class="shape shape-style-1 shape-default shape-skew">
                    <span/><span/><span/><span/><span/><span/><span/><span/><span/>
                </div>
                <div class="container shape-container d-flex">
                    <div class="col px-0">
                        <div class="row">
                            <div class="col-lg-10"><h1 class="display-3  text-white">RMS开源小站 一个易用Redis数据库管理平台
                                <span>具有全面的性能监控指标及管理工具</span></h1>
                                <p class="lead  text-white">
                                    本系统提供了丰富功能，包括数据库性能指标监控，自定义命令监控，
                                </p>
                                <p class="lead  text-white">
                                    远程命令行工具，数据备份恢复，多实例支持等。
                                </p>
                                <p class="lead  text-white">
                                    只需注册添加Redis实例并简单配置，即可体验全套功能。
                                </p>
                                <div class="btn-wrapper">
                                    <el-button class="started">
                                        <span><i class="fa fa-code"/></span>
                                        <span class="btn_txt"
                                              @click="download">开始体验</span>
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="section section-lg pt-lg-0 mt--200">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-12">
                            <div class="row row-grid">
                                <div class="col-lg-4">
                                    <div class="card card-lift--hover shadow border-0">
                                        <div class="card-body py-5">
                                            <div class="icon icon-shape icon-shape-primary rounded-circle mb-4">
                                                <i class="fa fa-check"/>
                                            </div>
                                            <h6 class="text-primary text-uppercase">基于INFO命令</h6>
                                            <p class="description mt-3">
                                                Oxygen基于Redis数据库INFO命令的开源监控工具，性能指标采集均来自INFO命令的结果
                                                更高效，非阻塞，不会给数据库带来额外负担，监控指标涵盖物理性能、数据变化、客户端连接、命令统计等多个方面。
                                            </p>
                                            <div>
                                                <span class="badge badge-pill badge-primary">高效的</span>
                                                <span class="badge badge-pill badge-primary">非阻塞</span>
                                                <span class="badge badge-pill badge-primary">全方位</span>
                                            </div>
                                            <a href="https://docs.csnight.xyz" target="_blank"
                                               class="btn btn-primary mt-4">了解更多</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-4">
                                    <div class="card card-lift--hover shadow border-0">
                                        <div class="card-body py-5">
                                            <div class="icon icon-shape icon-shape-success rounded-circle mb-4">
                                                <i class="fa fa-cube"/>
                                            </div>
                                            <h6 class="text-success text-uppercase">自定义监控</h6>
                                            <p class="description mt-3">Oxygen提供了可配置指令执行定时任务、性能监控统计任务、毫秒级的数据监控定时任务，
                                                保证了多样化的监控管理需求，使用户能够实时的监控Redis数据库的各项变化。
                                            </p>
                                            <div>
                                                <span class="badge badge-pill badge-success">时效性</span>
                                                <span class="badge badge-pill badge-success">可配置</span>
                                                <span class="badge badge-pill badge-success">灵活的</span>
                                            </div>
                                            <a href="https://docs.csnight.xyz" target="_blank"
                                               class="btn btn-primary mt-4">了解更多</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-4">
                                    <div class="card card-lift--hover shadow border-0">
                                        <div class="card-body py-5">
                                            <div class="icon icon-shape icon-shape-warning rounded-circle mb-4">
                                                <i class="fa fa-rocket"/>
                                            </div>
                                            <h6 class="text-warning text-uppercase">Online Operation</h6>
                                            <p class="description mt-3">Oxygen系统提供了完善的Redis管理工具，能够实现对数据库的配置管理实时修改，
                                                数据备份恢复同步等工作。并提供了浏览器端的Redis远程命令行客户端，告别shell小黑窗。
                                            </p>
                                            <div>
                                                <span class="badge badge-pill badge-warning">命令行</span>
                                                <span class="badge badge-pill badge-warning">日志库</span>
                                                <span class="badge badge-pill badge-warning">热管理</span>
                                            </div>
                                            <a href="https://docs.csnight.xyz" target="_blank"
                                               class="btn btn-primary mt-4">了解更多</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
        <footer class="footer has-cards">
            <div class="container">
                <div class="row row-grid align-items-center my-md">
                    <div class="col-lg-6">
                        <h3 class="text-primary font-weight-light mb-2">感谢您的支持！</h3>
                        <h4 class="mb-0 font-weight-light">如需联系我们，请前往我们的Github。</h4>
                    </div>
                    <div class="col-lg-6 text-lg-center btn-wrapper">
                        <a target="_blank" href="https://github.com/CSNight/RedisMonitorServices"
                           class="btn btn-neutral btn-icon-only btn-github btn-round btn-lg" data-toggle="tooltip"
                           data-original-title="Star on Github">
                            <i class="fa fa-github"/>
                        </a>
                    </div>
                </div>
                <hr>
                <div class="row align-items-center justify-content-md-between">
                    <div class="col-md-2">
                        <div class="copyright" style="display: flex;align-items: center">
                            &copy; 2019 <a href="https://github.com/CSNight" target="_blank">CSNight</a>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <ul class="nav nav-footer justify-content-end">
                            <li class="nav-item" style="display: flex;align-items: center">
                                <a class="nav-link" href="http://www.beian.miit.gov.cn"
                                   target="_blank">RMS开源小站 - 京ICP备20008725号</a>
                            </li>
                            <li class="nav-item" style="display: flex;align-items: center">
                                <a target="_blank" class="nav-link" style="display: flex;align-items: center"
                                   href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010502040454">
                                    <img :src="ba" alt=""/> 京公网安备 11010502040454号</a>
                            </li>
                            <li class="nav-item" style="display: flex;align-items: center">
                                <a href="https://github.com/CSNight/RedisMonitorServices/blob/master/LICENSE"
                                   class="nav-link" target="_blank">MIT License</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
    import LoginForm from "./LoginForm";
    import {mapGetters} from 'vuex'

    export default {
        name: "Landing",
        components: {LoginForm},
        data() {
            return {
                isLogin: true,
                enabledTypeOptions: [
                    {key: 'true', display_name: '正常'},
                    {key: 'false', display_name: '禁用'}
                ],
                // eslint-disable-next-line no-undef
                src: require('../../assets/white.png'),
                // eslint-disable-next-line no-undef
                ba: require('../../assets/ba.png'),
                sign_in: '登录',
                sign_up: '注册'
            }
        }, computed: {
            ...mapGetters([
                'name',
                'token',
                'baseUrl'
            ])
        }, created() {
            this.$nextTick(() => {
                this.recover_login();
            });
        }, methods: {
            hasRole(role) {
                return this.$store.getters.roles.indexOf(role) !== -1;
            },
            recover_login() {
                if (this.token) {
                    this.$store.dispatch('user/user_info', '').then((resp) => {
                        if (resp.status !== 200) {
                            this.login();
                        }
                    })
                }
            },
            login() {
                this.isLogin = true;
                const _this = this.$refs.form;
                _this.dialog = true
            },
            register() {
                this.isLogin = false;
                const _this = this.$refs.form;
                _this.dialog = true
            }, signOut() {
                this.$store.dispatch('user/logout').then((data) => {
                    this.$message({
                        type: 'info',
                        message: data.message.username + " logout!"
                    })
                });
            }, download() {
                window.open('https://github.com/CSNight/redis_oxygen/releases', '_blank');
            }
        }
    }
</script>

<style scoped>
    .fa {
        font-weight: bold;
    }

    .footer.has-cards {
        overflow: hidden;
        position: relative;
        background: transparent;
    }

    .footer {
        background: #f4f5f7;
        padding: 3rem 0;
    }

    .display-1 span, .display-2 span, .display-3 span, .display-4 span {
        display: block;
        font-weight: 300;
    }

    .mt--200 {
        margin-top: -200px !important;
    }

    .pt-lg-0 {
        padding-top: 0 !important;
    }

    .col-lg-12 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 100%;
        flex: 0 0 100%;
        max-width: 100%;
    }

    .col-lg-4 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 33.33333%;
        flex: 0 0 33.33333%;
        max-width: 33.33333%;
    }

    .card {
        position: relative;
    }

    .justify-content-center {
        -webkit-box-pack: center !important;
        -ms-flex-pack: center !important;
        justify-content: center !important;
    }

    .started {
        color: #fff;
        background-color: #11cdef;
        border-color: #11cdef;
        font-weight: bold;
    }

    .btn_txt {
        margin-left: .75rem;
    }

    .landing {
        font-family: Open Sans, sans-serif;
        overflow: auto;
        height: 100%;
    }

    .my-md {
        margin-top: 4rem !important;
    }

    .align-items-center {
        -webkit-box-align: center !important;
        -ms-flex-align: center !important;
        align-items: center !important;
    }

    .section-shaped {
        margin: 180px 0;
        position: relative;
    }

    .mb-0, .my-0 {
        margin-bottom: 0 !important;
    }

    .mt-0, .my-0 {
        margin-top: 0 !important;
    }

    .section-shaped .shape-style-1.shape-default {
        background: linear-gradient(150deg, #7795f8 15%, #6772e5 70%, #555abf 94%);
    }

    .section-shaped .shape-skew {
        -webkit-transform: skewY(-8deg);
        transform: skewY(-8deg);
        -webkit-transform-origin: 0;
        transform-origin: 0;
    }

    .section-shaped .shape.shape-skew + .shape-container {
        padding-top: 18rem;
        padding-bottom: 19rem;
    }

    .section-shaped .shape {
        position: absolute;
        top: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
    }

    .section-shaped .shape.shape-skew + .container .col {
        margin-top: -100px;
    }

    .pl-0, .px-0 {
        padding-left: 0 !important;
    }

    .row {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        margin-right: -15px;
        margin-left: -15px;
    }

    .container {
        width: 100%;
        padding-right: 15px;
        padding-left: 15px;
        margin-right: auto;
        margin-left: auto;
    }

    .section-shaped {
        margin: 180px 0;
        position: relative;
    }

    .text-white {
        color: #fff !important;
    }

    .display-3 {
        font-weight: 600;
        line-height: 1.3;
    }

    .display-3 {
        font-size: 2.1875rem;
    }

    .section-shaped .shape + .container {
        position: relative;
        padding-top: 6rem;
        padding-bottom: 0;
        height: 100%;
    }

    .col, .col-lg-6 {
        position: relative;
        width: 100%;
        min-height: 1px;
        padding-right: 15px;
        padding-left: 15px;
    }

    .col {
        -ms-flex-preferred-size: 0;
        flex-basis: 0;
        -webkit-box-flex: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        max-width: 100%;
    }


    .section-shaped .shape span {
        position: absolute;
    }


    .card-lift--hover:hover {
        transition: all .15s ease;
        transform: translateY(-20px);
    }

    .icon-shape-primary {
        color: #2643e9;
        background-color: rgba(138, 152, 235, .5);
    }

    .text-primary {
        color: #5e72e4 !important;
    }

    .text-uppercase {
        text-transform: uppercase !important;
    }

    .description {
        font-size: .875rem;
    }

    .mt-3, .my-3 {
        margin-top: 1rem !important;
    }

    .badge-pill {
        padding-right: .875em;
        padding-left: .875em;
        border-radius: 10rem;
    }

    .badge {
        text-transform: uppercase;
    }

    .badge-primary {
        color: #2643e9;
        background-color: rgba(203, 210, 246, .5);
    }

    .btn {
        position: relative;
        text-transform: uppercase;
        -webkit-transition: all .15s ease;
        transition: all .15s ease;
        will-change: transform;
        letter-spacing: .025em;
        font-size: .875rem;
    }

    .mt-4 {
        margin-top: 1.5rem !important;
    }

    .btn-primary, .btn-primary:hover {
        color: #fff;
        background-color: #5e72e4;
        border-color: #5e72e4;
    }

    .btn-primary {
        -webkit-box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
    }

    .btn {
        display: inline-block;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: 1px solid transparent;
        padding: .625rem 1.25rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
    }

    .btn-github, .btn-github:hover {
        color: #fff;
        background-color: #222;
        border-color: #222;
    }

    .btn-github {
        -webkit-box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
    }

    .btn-icon-only {
        width: 2.375rem;
        height: 2.375rem;
        padding: 0;
    }

    .col-lg-6 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 50%;
        flex: 0 0 50%;
        max-width: 50%;
    }

    .footer .copyright {
        font-size: .875rem;
    }

    .nav {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
    }

    .footer .footer-link, .footer .nav .nav-item .nav-link {
        color: #8898aa !important;
    }

    .nav-footer .nav-link {
        font-size: .875rem;
    }

    .nav-link {
        display: block;
        padding: .25rem .75rem;
    }

    .justify-content-end {
        -webkit-box-pack: end !important;
        -ms-flex-pack: end !important;
        justify-content: flex-end !important;
    }

    .col-md-6 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 50%;
        flex: 0 0 50%;
        max-width: 50%;
    }

    .justify-content-md-between {
        -webkit-box-pack: justify !important;
        -ms-flex-pack: justify !important;
        justify-content: space-between !important;
    }

    .text-lg-center {
        text-align: center !important;
    }

    .font-weight-light {
        font-weight: 300 !important;
    }

    a.btn-icon-only {
        line-height: 2.5;
        cursor: pointer;
    }


    .badge {
        display: inline-block;
        padding: .35rem .375rem;
        font-size: 66%;
        font-weight: 600;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
    }

    .lead, p {
        font-weight: 300;
        line-height: 1.7;
    }

    .icon-shape {
        padding: 12px;
        text-align: center;
        display: -ms-inline-flexbox;
        display: inline-flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        border-radius: 50%;
    }

    [class*=shadow] {
        -webkit-transition: all .15s ease;
        transition: all .15s ease;
    }

    .card {
        border: 0 !important;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #fff;
        background-clip: border-box;
        border-radius: .25rem;
    }

    .pb-5, .py-5 {
        padding-bottom: 3rem !important;
    }

    .pt-5, .py-5 {
        padding-top: 3rem !important;
    }

    .card-body {
        -webkit-box-flex: 1;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        padding: 1.5rem;
    }

    .profile-page .card-profile .card-profile-image img, .shadow {
        -webkit-box-shadow: 0 15px 35px rgba(50, 50, 93, .1), 0 5px 15px rgba(0, 0, 0, .07) !important;
        box-shadow: 0 15px 35px rgba(50, 50, 93, .1), 0 5px 15px rgba(0, 0, 0, .07) !important;
    }

    .icon-shape-success {
        color: #1aae6f;
        background-color: rgba(84, 218, 161, .5);
    }

    .text-success {
        color: #2dce89 !important;
    }

    .badge-success {
        color: #1aae6f;
        background-color: rgba(147, 231, 195, .5);
    }

    .mt-4, .my-4 {
        margin-top: 1.5rem !important;
    }

    .btn-success, .btn-success:hover {
        color: #fff;
        background-color: #2dce89;
        border-color: #2dce89;
    }

    .btn-success {
        -webkit-box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
    }

    .icon-shape-warning {
        color: #ff3709;
        background-color: rgba(252, 140, 114, .5);
    }

    .text-warning {
        color: #fb6340 !important;
    }

    .badge-warning {
        color: #ff3709;
        background-color: rgba(254, 201, 189, .5);
    }

    .btn-warning, .btn-warning:hover {
        color: #fff;
        background-color: #fb6340;
        border-color: #fb6340;
    }

    .btn-warning {
        -webkit-box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
    }

    .col, .col-lg-4, .col-lg-6, .col-lg-10, .col-lg-12, .col-md-6 {
        position: relative;
        width: 100%;
        min-height: 1px;
        padding-right: 15px;
        padding-left: 15px;
    }

    .container {
        max-width: 1040px;
    }

    .d-flex {
        display: -webkit-box !important;
        display: -ms-flexbox !important;
        display: flex !important;
    }

    .section-shaped .shape-style-1 :first-child {
        left: -4%;
        bottom: auto;
        background: hsla(0, 0%, 100%, .1);

    }

    .section-shaped .shape-style-1 :nth-child(2) {
        right: 4%;
        top: 10%;
        background: hsla(0, 0%, 100%, .1);
    }

    .section-shaped .shape-style-1 :nth-child(3) {
        top: 280px;
        right: 5.66666%;
        background: hsla(0, 0%, 100%, .3);
    }

    .section-shaped .shape-style-1 :nth-child(4) {
        top: 320px;
        right: 7%;
        background: hsla(0, 0%, 100%, .15);
    }

    .section-shaped .shape-style-1 :nth-child(5) {
        top: 38%;
        right: auto;
        left: 1%;

        background: rgba(255, 255, 255, .05);
    }

    .section-shaped .shape-style-1 :nth-child(6) {
        top: 44%;
        right: auto;
        left: 10%;

        width: 200px;
        height: 200px;

        background: rgba(255, 255, 255, .15);
    }

    .section-shaped .shape-style-1 :nth-child(7) {
        right: 36%;
        bottom: 50%;

        background: rgba(255, 255, 255, .04);
    }

    .section-shaped .shape-style-1 :nth-child(8) {
        right: 2%;
        bottom: 70px;

        background: rgba(255, 255, 255, .2);
    }

    .section-shaped .shape-style-1 :nth-child(9) {
        right: 2%;
        bottom: 1%;

        background: rgba(255, 255, 255, .1);
    }

    .section-shaped .shape-style-1 :nth-child(10) {
        right: auto;
        bottom: 1%;
        left: 1%;

        background: rgba(255, 255, 255, .05);
    }

    .section-shaped .shape-style-1 span {
        height: 120px;
        width: 120px;
        border-radius: 50%;
    }

    .section-shaped .shape-skew span {
        -webkit-transform: skew(8deg);
        transform: skew(8deg);
    }

    .lead {
        font-size: 1.25rem;
        margin-top: 1.0rem;
        font-family: Open Sans, sans-serif;
    }

    .lead, p {
        font-weight: 300;
        line-height: 1.7;
        font-family: Open Sans, sans-serif;
    }

    .menu {
        width: 400px;
        border-bottom: none !important;
        background: linear-gradient(to right, #748AF2 30%, #6F85EF 100%) !important;
    }
</style>
