import {
	builtIn,
	vuelifeHooks
} from './base.js'

import {
	afterHooks,
	beforeHooks,
	registerRouter
} from './concat.js'

import {
	fromatRoutes
} from './util.js'

/**
 * 在uni-app没有注入生命周期时先直接代理相关生命周期数组
 * @param {Object} vueRouter
 * @param {Object} key
 */
function defineProperty(vueRouter, key, hookFun) {
	const vueOldHooks = vuelifeHooks[key];
	return new Proxy([], {
		get: (target, prop) => {
			return prop in target ? target[prop] : undefined
		},
		set: (target, prop, value) => {
			if (typeof value == 'function') {
				vueOldHooks.splice(0, 1, value);
				target[prop] = hookFun;
			} else {
				target[prop] = value;
			}
			return true
		}
	})
}
/**
 * 拦截并注册vueRouter中的生命钩子，路由表解析
 * @param {Object} Router 
 * @param {vueRouter} vueRouter 
 */
export default function init(Router, vueRouter) {
	 console.log(Router)
	// console.log(vueRouter)

	const CONFIG = Router.CONFIG.h5;
	vueRouter.afterHooks = defineProperty(vueRouter, 'afterHooks', afterHooks);
	vueRouter.beforeHooks = defineProperty(vueRouter, 'beforeHooks', beforeHooks);
	
	const objVueRoutes= fromatRoutes(vueRouter.options.routes,false);		//返回一个格式化好的routes 键值对的形式
	const objSelfRoutes= fromatRoutes(Router.CONFIG.routes,true,CONFIG.useUniConfig);
	Router.vueRoutes=objVueRoutes;		//挂载vue-routes到当前的路由下
	Router.selfRoutes=objSelfRoutes;	//挂载self-routes到当前路由下
	registerRouter(Router, vueRouter, CONFIG.vueRouter);
}