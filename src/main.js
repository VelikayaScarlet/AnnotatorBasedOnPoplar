// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify);
Vue.use(VueI18n);
const i18n = new VueI18n({
    locale: 'zh',
    messages: {
        zh: require('./common/zh'),
        en: require('./common/en')
    }
});


Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    i18n,
    router,
    components: {App},
    template: '<App/>'
});
//接下来要实现的功能：在下面加按钮√，切换文本显示√；第一页写使用说明√；
//通过json文件展示已经标注的词（右侧）√，添加词语和关系（这些都储存在json里面）√
//v-dialog的实时刷新√
//空白文本拒绝，如果还有词，怎么删除？重复添加
//可能实现的进阶功能