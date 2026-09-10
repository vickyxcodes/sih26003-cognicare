var Nu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nl=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Af=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],a=r[t++],u=r[t++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|u&63)-65536;e[n++]=String.fromCharCode(55296+(c>>10)),e[n++]=String.fromCharCode(56320+(c&1023))}else{const i=r[t++],a=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},rl={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],a=s+1<r.length,u=a?r[s+1]:0,c=s+2<r.length,h=c?r[s+2]:0,f=i>>2,g=(i&3)<<4|u>>4;let _=(u&15)<<2|h>>6,b=h&63;c||(b=64,a||(_=64)),n.push(t[f],t[g],t[_],t[b])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(nl(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):Af(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],u=s<r.length?t[r.charAt(s)]:0;++s;const h=s<r.length?t[r.charAt(s)]:64;++s;const g=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||u==null||h==null||g==null)throw new bf;const _=i<<2|u>>4;if(n.push(_),h!==64){const b=u<<4&240|h>>2;if(n.push(b),g!==64){const C=h<<6&192|g;n.push(C)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class bf extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Rf=function(r){const e=nl(r);return rl.encodeByteArray(e,!0)},Ls=function(r){return Rf(r).replace(/\./g,"")},Pf=function(r){try{return rl.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sf(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vf=()=>Sf().__FIREBASE_DEFAULTS__,Cf=()=>{if(typeof process>"u"||typeof Nu>"u")return;const r=Nu.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Df=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&Pf(r[1]);return e&&JSON.parse(e)},ti=()=>{try{return Vf()||Cf()||Df()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},xf=r=>{var e,t;return(t=(e=ti())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[r]},Nf=r=>{const e=xf(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},sl=()=>{var r;return(r=ti())===null||r===void 0?void 0:r.config},OI=r=>{var e;return(e=ti())===null||e===void 0?void 0:e[`_${r}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kf{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mf(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},r);return[Ls(JSON.stringify(t)),Ls(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wn(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function FI(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(wn())}function Of(){var r;const e=(r=ti())===null||r===void 0?void 0:r.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function LI(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function BI(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function UI(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function qI(){const r=wn();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function il(){return!Of()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function ol(){try{return typeof indexedDB=="object"}catch{return!1}}function Ff(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lf="FirebaseError";class Bn extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=Lf,Object.setPrototypeOf(this,Bn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,al.prototype.create)}}class al{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?Bf(i,n):"Error",u=`${this.serviceName}: ${a} (${s}).`;return new Bn(s,u,n)}}function Bf(r,e){return r.replace(Uf,(t,n)=>{const s=e[n];return s!=null?String(s):`<${n}?>`})}const Uf=/\{\$([^}]+)}/g;function jI(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function Ht(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],a=e[s];if(ku(i)&&ku(a)){if(!Ht(i,a))return!1}else if(i!==a)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function ku(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zI(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function GI(r){const e={};return r.replace(/^\?/,"").split("&").forEach(n=>{if(n){const[s,i]=n.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function KI(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function $I(r,e){const t=new qf(r,e);return t.subscribe.bind(t)}class qf{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let s;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");jf(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:n},s.next===void 0&&(s.next=Wi),s.error===void 0&&(s.error=Wi),s.complete===void 0&&(s.complete=Wi);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function jf(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function Wi(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(r){return r&&r._delegate?r._delegate:r}class Dr{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zf{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new kf;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Kf(e))try{this.getOrInitializeService({instanceIdentifier:qt})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(e=qt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=qt){return this.instances.has(e)}getOptions(e=qt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[i,a]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(i);n===u&&a.resolve(s)}return s}onInit(e,t){var n;const s=this.normalizeInstanceIdentifier(t),i=(n=this.onInitCallbacks.get(s))!==null&&n!==void 0?n:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Gf(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=qt){return this.component?this.component.multipleInstances?e:qt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Gf(r){return r===qt?void 0:r}function Kf(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $f{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new zf(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Y;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(Y||(Y={}));const Qf={debug:Y.DEBUG,verbose:Y.VERBOSE,info:Y.INFO,warn:Y.WARN,error:Y.ERROR,silent:Y.SILENT},Wf=Y.INFO,Hf={[Y.DEBUG]:"log",[Y.VERBOSE]:"log",[Y.INFO]:"info",[Y.WARN]:"warn",[Y.ERROR]:"error"},Jf=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=Hf[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ul{constructor(e){this.name=e,this._logLevel=Wf,this._logHandler=Jf,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Y))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Qf[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Y.DEBUG,...e),this._logHandler(this,Y.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Y.VERBOSE,...e),this._logHandler(this,Y.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Y.INFO,...e),this._logHandler(this,Y.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Y.WARN,...e),this._logHandler(this,Y.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Y.ERROR,...e),this._logHandler(this,Y.ERROR,...e)}}const Yf=(r,e)=>e.some(t=>r instanceof t);let Mu,Ou;function Xf(){return Mu||(Mu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Zf(){return Ou||(Ou=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const cl=new WeakMap,io=new WeakMap,ll=new WeakMap,Hi=new WeakMap,Do=new WeakMap;function em(r){const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",a)},i=()=>{t(yt(r.result)),s()},a=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&cl.set(t,r)}).catch(()=>{}),Do.set(e,r),e}function tm(r){if(io.has(r))return;const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",a),r.removeEventListener("abort",a)},i=()=>{t(),s()},a=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",a),r.addEventListener("abort",a)});io.set(r,e)}let oo={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return io.get(r);if(e==="objectStoreNames")return r.objectStoreNames||ll.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return yt(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function nm(r){oo=r(oo)}function rm(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=r.call(Ji(this),e,...t);return ll.set(n,e.sort?e.sort():[e]),yt(n)}:Zf().includes(r)?function(...e){return r.apply(Ji(this),e),yt(cl.get(this))}:function(...e){return yt(r.apply(Ji(this),e))}}function sm(r){return typeof r=="function"?rm(r):(r instanceof IDBTransaction&&tm(r),Yf(r,Xf())?new Proxy(r,oo):r)}function yt(r){if(r instanceof IDBRequest)return em(r);if(Hi.has(r))return Hi.get(r);const e=sm(r);return e!==r&&(Hi.set(r,e),Do.set(e,r)),e}const Ji=r=>Do.get(r);function im(r,e,{blocked:t,upgrade:n,blocking:s,terminated:i}={}){const a=indexedDB.open(r,e),u=yt(a);return n&&a.addEventListener("upgradeneeded",c=>{n(yt(a.result),c.oldVersion,c.newVersion,yt(a.transaction),c)}),t&&a.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),u.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),u}const om=["get","getKey","getAll","getAllKeys","count"],am=["put","add","delete","clear"],Yi=new Map;function Fu(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(Yi.get(e))return Yi.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,s=am.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(s||om.includes(t)))return;const i=async function(a,...u){const c=this.transaction(a,s?"readwrite":"readonly");let h=c.store;return n&&(h=h.index(u.shift())),(await Promise.all([h[t](...u),s&&c.done]))[0]};return Yi.set(e,i),i}nm(r=>({...r,get:(e,t,n)=>Fu(e,t)||r.get(e,t,n),has:(e,t)=>!!Fu(e,t)||r.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class um{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(cm(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function cm(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ao="@firebase/app",Lu="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const et=new ul("@firebase/app"),lm="@firebase/app-compat",hm="@firebase/analytics-compat",dm="@firebase/analytics",fm="@firebase/app-check-compat",mm="@firebase/app-check",gm="@firebase/auth",pm="@firebase/auth-compat",_m="@firebase/database",ym="@firebase/data-connect",Im="@firebase/database-compat",Em="@firebase/functions",Tm="@firebase/functions-compat",vm="@firebase/installations",wm="@firebase/installations-compat",Am="@firebase/messaging",bm="@firebase/messaging-compat",Rm="@firebase/performance",Pm="@firebase/performance-compat",Sm="@firebase/remote-config",Vm="@firebase/remote-config-compat",Cm="@firebase/storage",Dm="@firebase/storage-compat",xm="@firebase/firestore",Nm="@firebase/vertexai-preview",km="@firebase/firestore-compat",Mm="firebase",Om="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bs="[DEFAULT]",Fm={[ao]:"fire-core",[lm]:"fire-core-compat",[dm]:"fire-analytics",[hm]:"fire-analytics-compat",[mm]:"fire-app-check",[fm]:"fire-app-check-compat",[gm]:"fire-auth",[pm]:"fire-auth-compat",[_m]:"fire-rtdb",[ym]:"fire-data-connect",[Im]:"fire-rtdb-compat",[Em]:"fire-fn",[Tm]:"fire-fn-compat",[vm]:"fire-iid",[wm]:"fire-iid-compat",[Am]:"fire-fcm",[bm]:"fire-fcm-compat",[Rm]:"fire-perf",[Pm]:"fire-perf-compat",[Sm]:"fire-rc",[Vm]:"fire-rc-compat",[Cm]:"fire-gcs",[Dm]:"fire-gcs-compat",[xm]:"fire-fst",[km]:"fire-fst-compat",[Nm]:"fire-vertex","fire-js":"fire-js",[Mm]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Us=new Map,Lm=new Map,uo=new Map;function Bu(r,e){try{r.container.addComponent(e)}catch(t){et.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function qs(r){const e=r.name;if(uo.has(e))return et.debug(`There were multiple attempts to register component ${e}.`),!1;uo.set(e,r);for(const t of Us.values())Bu(t,r);for(const t of Lm.values())Bu(t,r);return!0}function xo(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function Bm(r,e,t=Bs){xo(r,e).clearInstance(t)}function QI(r){return r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Um={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},It=new al("app","Firebase",Um);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(e,t,n){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new Dr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw It.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jm=Om;function zm(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n=Object.assign({name:Bs,automaticDataCollectionEnabled:!1},e),s=n.name;if(typeof s!="string"||!s)throw It.create("bad-app-name",{appName:String(s)});if(t||(t=sl()),!t)throw It.create("no-options");const i=Us.get(s);if(i){if(Ht(t,i.options)&&Ht(n,i.config))return i;throw It.create("duplicate-app",{appName:s})}const a=new $f(s);for(const c of uo.values())a.addComponent(c);const u=new qm(t,n,a);return Us.set(s,u),u}function Gm(r=Bs){const e=Us.get(r);if(!e&&r===Bs&&sl())return zm();if(!e)throw It.create("no-app",{appName:r});return e}function Ar(r,e,t){var n;let s=(n=Fm[r])!==null&&n!==void 0?n:r;t&&(s+=`-${t}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const u=[`Unable to register library "${s}" with version "${e}":`];i&&u.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&u.push("and"),a&&u.push(`version name "${e}" contains illegal characters (whitespace or "/")`),et.warn(u.join(" "));return}qs(new Dr(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Km="firebase-heartbeat-database",$m=1,xr="firebase-heartbeat-store";let Xi=null;function hl(){return Xi||(Xi=im(Km,$m,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(xr)}catch(t){console.warn(t)}}}}).catch(r=>{throw It.create("idb-open",{originalErrorMessage:r.message})})),Xi}async function Qm(r){try{const t=(await hl()).transaction(xr),n=await t.objectStore(xr).get(dl(r));return await t.done,n}catch(e){if(e instanceof Bn)et.warn(e.message);else{const t=It.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});et.warn(t.message)}}}async function Uu(r,e){try{const n=(await hl()).transaction(xr,"readwrite");await n.objectStore(xr).put(e,dl(r)),await n.done}catch(t){if(t instanceof Bn)et.warn(t.message);else{const n=It.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});et.warn(n.message)}}}function dl(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wm=1024,Hm=30*24*60*60*1e3;class Jm{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Xm(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=qu();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const u=new Date(a.date).valueOf();return Date.now()-u<=Hm}),this._storage.overwrite(this._heartbeatsCache))}catch(n){et.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=qu(),{heartbeatsToSend:n,unsentEntries:s}=Ym(this._heartbeatsCache.heartbeats),i=Ls(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return et.warn(t),""}}}function qu(){return new Date().toISOString().substring(0,10)}function Ym(r,e=Wm){const t=[];let n=r.slice();for(const s of r){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),ju(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),ju(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class Xm{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ol()?Ff().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Qm(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Uu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Uu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ju(r){return Ls(JSON.stringify({version:2,heartbeats:r})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zm(r){qs(new Dr("platform-logger",e=>new um(e),"PRIVATE")),qs(new Dr("heartbeat",e=>new Jm(e),"PRIVATE")),Ar(ao,Lu,r),Ar(ao,Lu,"esm2017"),Ar("fire-js","")}Zm("");var zu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Qt,fl;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(E,p){function I(){}I.prototype=p.prototype,E.D=p.prototype,E.prototype=new I,E.prototype.constructor=E,E.C=function(T,v,R){for(var y=Array(arguments.length-2),Je=2;Je<arguments.length;Je++)y[Je-2]=arguments[Je];return p.prototype[v].apply(T,y)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(n,t),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(E,p,I){I||(I=0);var T=Array(16);if(typeof p=="string")for(var v=0;16>v;++v)T[v]=p.charCodeAt(I++)|p.charCodeAt(I++)<<8|p.charCodeAt(I++)<<16|p.charCodeAt(I++)<<24;else for(v=0;16>v;++v)T[v]=p[I++]|p[I++]<<8|p[I++]<<16|p[I++]<<24;p=E.g[0],I=E.g[1],v=E.g[2];var R=E.g[3],y=p+(R^I&(v^R))+T[0]+3614090360&4294967295;p=I+(y<<7&4294967295|y>>>25),y=R+(v^p&(I^v))+T[1]+3905402710&4294967295,R=p+(y<<12&4294967295|y>>>20),y=v+(I^R&(p^I))+T[2]+606105819&4294967295,v=R+(y<<17&4294967295|y>>>15),y=I+(p^v&(R^p))+T[3]+3250441966&4294967295,I=v+(y<<22&4294967295|y>>>10),y=p+(R^I&(v^R))+T[4]+4118548399&4294967295,p=I+(y<<7&4294967295|y>>>25),y=R+(v^p&(I^v))+T[5]+1200080426&4294967295,R=p+(y<<12&4294967295|y>>>20),y=v+(I^R&(p^I))+T[6]+2821735955&4294967295,v=R+(y<<17&4294967295|y>>>15),y=I+(p^v&(R^p))+T[7]+4249261313&4294967295,I=v+(y<<22&4294967295|y>>>10),y=p+(R^I&(v^R))+T[8]+1770035416&4294967295,p=I+(y<<7&4294967295|y>>>25),y=R+(v^p&(I^v))+T[9]+2336552879&4294967295,R=p+(y<<12&4294967295|y>>>20),y=v+(I^R&(p^I))+T[10]+4294925233&4294967295,v=R+(y<<17&4294967295|y>>>15),y=I+(p^v&(R^p))+T[11]+2304563134&4294967295,I=v+(y<<22&4294967295|y>>>10),y=p+(R^I&(v^R))+T[12]+1804603682&4294967295,p=I+(y<<7&4294967295|y>>>25),y=R+(v^p&(I^v))+T[13]+4254626195&4294967295,R=p+(y<<12&4294967295|y>>>20),y=v+(I^R&(p^I))+T[14]+2792965006&4294967295,v=R+(y<<17&4294967295|y>>>15),y=I+(p^v&(R^p))+T[15]+1236535329&4294967295,I=v+(y<<22&4294967295|y>>>10),y=p+(v^R&(I^v))+T[1]+4129170786&4294967295,p=I+(y<<5&4294967295|y>>>27),y=R+(I^v&(p^I))+T[6]+3225465664&4294967295,R=p+(y<<9&4294967295|y>>>23),y=v+(p^I&(R^p))+T[11]+643717713&4294967295,v=R+(y<<14&4294967295|y>>>18),y=I+(R^p&(v^R))+T[0]+3921069994&4294967295,I=v+(y<<20&4294967295|y>>>12),y=p+(v^R&(I^v))+T[5]+3593408605&4294967295,p=I+(y<<5&4294967295|y>>>27),y=R+(I^v&(p^I))+T[10]+38016083&4294967295,R=p+(y<<9&4294967295|y>>>23),y=v+(p^I&(R^p))+T[15]+3634488961&4294967295,v=R+(y<<14&4294967295|y>>>18),y=I+(R^p&(v^R))+T[4]+3889429448&4294967295,I=v+(y<<20&4294967295|y>>>12),y=p+(v^R&(I^v))+T[9]+568446438&4294967295,p=I+(y<<5&4294967295|y>>>27),y=R+(I^v&(p^I))+T[14]+3275163606&4294967295,R=p+(y<<9&4294967295|y>>>23),y=v+(p^I&(R^p))+T[3]+4107603335&4294967295,v=R+(y<<14&4294967295|y>>>18),y=I+(R^p&(v^R))+T[8]+1163531501&4294967295,I=v+(y<<20&4294967295|y>>>12),y=p+(v^R&(I^v))+T[13]+2850285829&4294967295,p=I+(y<<5&4294967295|y>>>27),y=R+(I^v&(p^I))+T[2]+4243563512&4294967295,R=p+(y<<9&4294967295|y>>>23),y=v+(p^I&(R^p))+T[7]+1735328473&4294967295,v=R+(y<<14&4294967295|y>>>18),y=I+(R^p&(v^R))+T[12]+2368359562&4294967295,I=v+(y<<20&4294967295|y>>>12),y=p+(I^v^R)+T[5]+4294588738&4294967295,p=I+(y<<4&4294967295|y>>>28),y=R+(p^I^v)+T[8]+2272392833&4294967295,R=p+(y<<11&4294967295|y>>>21),y=v+(R^p^I)+T[11]+1839030562&4294967295,v=R+(y<<16&4294967295|y>>>16),y=I+(v^R^p)+T[14]+4259657740&4294967295,I=v+(y<<23&4294967295|y>>>9),y=p+(I^v^R)+T[1]+2763975236&4294967295,p=I+(y<<4&4294967295|y>>>28),y=R+(p^I^v)+T[4]+1272893353&4294967295,R=p+(y<<11&4294967295|y>>>21),y=v+(R^p^I)+T[7]+4139469664&4294967295,v=R+(y<<16&4294967295|y>>>16),y=I+(v^R^p)+T[10]+3200236656&4294967295,I=v+(y<<23&4294967295|y>>>9),y=p+(I^v^R)+T[13]+681279174&4294967295,p=I+(y<<4&4294967295|y>>>28),y=R+(p^I^v)+T[0]+3936430074&4294967295,R=p+(y<<11&4294967295|y>>>21),y=v+(R^p^I)+T[3]+3572445317&4294967295,v=R+(y<<16&4294967295|y>>>16),y=I+(v^R^p)+T[6]+76029189&4294967295,I=v+(y<<23&4294967295|y>>>9),y=p+(I^v^R)+T[9]+3654602809&4294967295,p=I+(y<<4&4294967295|y>>>28),y=R+(p^I^v)+T[12]+3873151461&4294967295,R=p+(y<<11&4294967295|y>>>21),y=v+(R^p^I)+T[15]+530742520&4294967295,v=R+(y<<16&4294967295|y>>>16),y=I+(v^R^p)+T[2]+3299628645&4294967295,I=v+(y<<23&4294967295|y>>>9),y=p+(v^(I|~R))+T[0]+4096336452&4294967295,p=I+(y<<6&4294967295|y>>>26),y=R+(I^(p|~v))+T[7]+1126891415&4294967295,R=p+(y<<10&4294967295|y>>>22),y=v+(p^(R|~I))+T[14]+2878612391&4294967295,v=R+(y<<15&4294967295|y>>>17),y=I+(R^(v|~p))+T[5]+4237533241&4294967295,I=v+(y<<21&4294967295|y>>>11),y=p+(v^(I|~R))+T[12]+1700485571&4294967295,p=I+(y<<6&4294967295|y>>>26),y=R+(I^(p|~v))+T[3]+2399980690&4294967295,R=p+(y<<10&4294967295|y>>>22),y=v+(p^(R|~I))+T[10]+4293915773&4294967295,v=R+(y<<15&4294967295|y>>>17),y=I+(R^(v|~p))+T[1]+2240044497&4294967295,I=v+(y<<21&4294967295|y>>>11),y=p+(v^(I|~R))+T[8]+1873313359&4294967295,p=I+(y<<6&4294967295|y>>>26),y=R+(I^(p|~v))+T[15]+4264355552&4294967295,R=p+(y<<10&4294967295|y>>>22),y=v+(p^(R|~I))+T[6]+2734768916&4294967295,v=R+(y<<15&4294967295|y>>>17),y=I+(R^(v|~p))+T[13]+1309151649&4294967295,I=v+(y<<21&4294967295|y>>>11),y=p+(v^(I|~R))+T[4]+4149444226&4294967295,p=I+(y<<6&4294967295|y>>>26),y=R+(I^(p|~v))+T[11]+3174756917&4294967295,R=p+(y<<10&4294967295|y>>>22),y=v+(p^(R|~I))+T[2]+718787259&4294967295,v=R+(y<<15&4294967295|y>>>17),y=I+(R^(v|~p))+T[9]+3951481745&4294967295,E.g[0]=E.g[0]+p&4294967295,E.g[1]=E.g[1]+(v+(y<<21&4294967295|y>>>11))&4294967295,E.g[2]=E.g[2]+v&4294967295,E.g[3]=E.g[3]+R&4294967295}n.prototype.u=function(E,p){p===void 0&&(p=E.length);for(var I=p-this.blockSize,T=this.B,v=this.h,R=0;R<p;){if(v==0)for(;R<=I;)s(this,E,R),R+=this.blockSize;if(typeof E=="string"){for(;R<p;)if(T[v++]=E.charCodeAt(R++),v==this.blockSize){s(this,T),v=0;break}}else for(;R<p;)if(T[v++]=E[R++],v==this.blockSize){s(this,T),v=0;break}}this.h=v,this.o+=p},n.prototype.v=function(){var E=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);E[0]=128;for(var p=1;p<E.length-8;++p)E[p]=0;var I=8*this.o;for(p=E.length-8;p<E.length;++p)E[p]=I&255,I/=256;for(this.u(E),E=Array(16),p=I=0;4>p;++p)for(var T=0;32>T;T+=8)E[I++]=this.g[p]>>>T&255;return E};function i(E,p){var I=u;return Object.prototype.hasOwnProperty.call(I,E)?I[E]:I[E]=p(E)}function a(E,p){this.h=p;for(var I=[],T=!0,v=E.length-1;0<=v;v--){var R=E[v]|0;T&&R==p||(I[v]=R,T=!1)}this.g=I}var u={};function c(E){return-128<=E&&128>E?i(E,function(p){return new a([p|0],0>p?-1:0)}):new a([E|0],0>E?-1:0)}function h(E){if(isNaN(E)||!isFinite(E))return g;if(0>E)return V(h(-E));for(var p=[],I=1,T=0;E>=I;T++)p[T]=E/I|0,I*=4294967296;return new a(p,0)}function f(E,p){if(E.length==0)throw Error("number format error: empty string");if(p=p||10,2>p||36<p)throw Error("radix out of range: "+p);if(E.charAt(0)=="-")return V(f(E.substring(1),p));if(0<=E.indexOf("-"))throw Error('number format error: interior "-" character');for(var I=h(Math.pow(p,8)),T=g,v=0;v<E.length;v+=8){var R=Math.min(8,E.length-v),y=parseInt(E.substring(v,v+R),p);8>R?(R=h(Math.pow(p,R)),T=T.j(R).add(h(y))):(T=T.j(I),T=T.add(h(y)))}return T}var g=c(0),_=c(1),b=c(16777216);r=a.prototype,r.m=function(){if(N(this))return-V(this).m();for(var E=0,p=1,I=0;I<this.g.length;I++){var T=this.i(I);E+=(0<=T?T:4294967296+T)*p,p*=4294967296}return E},r.toString=function(E){if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(C(this))return"0";if(N(this))return"-"+V(this).toString(E);for(var p=h(Math.pow(E,6)),I=this,T="";;){var v=$(I,p).g;I=q(I,v.j(p));var R=((0<I.g.length?I.g[0]:I.h)>>>0).toString(E);if(I=v,C(I))return R+T;for(;6>R.length;)R="0"+R;T=R+T}},r.i=function(E){return 0>E?0:E<this.g.length?this.g[E]:this.h};function C(E){if(E.h!=0)return!1;for(var p=0;p<E.g.length;p++)if(E.g[p]!=0)return!1;return!0}function N(E){return E.h==-1}r.l=function(E){return E=q(this,E),N(E)?-1:C(E)?0:1};function V(E){for(var p=E.g.length,I=[],T=0;T<p;T++)I[T]=~E.g[T];return new a(I,~E.h).add(_)}r.abs=function(){return N(this)?V(this):this},r.add=function(E){for(var p=Math.max(this.g.length,E.g.length),I=[],T=0,v=0;v<=p;v++){var R=T+(this.i(v)&65535)+(E.i(v)&65535),y=(R>>>16)+(this.i(v)>>>16)+(E.i(v)>>>16);T=y>>>16,R&=65535,y&=65535,I[v]=y<<16|R}return new a(I,I[I.length-1]&-2147483648?-1:0)};function q(E,p){return E.add(V(p))}r.j=function(E){if(C(this)||C(E))return g;if(N(this))return N(E)?V(this).j(V(E)):V(V(this).j(E));if(N(E))return V(this.j(V(E)));if(0>this.l(b)&&0>E.l(b))return h(this.m()*E.m());for(var p=this.g.length+E.g.length,I=[],T=0;T<2*p;T++)I[T]=0;for(T=0;T<this.g.length;T++)for(var v=0;v<E.g.length;v++){var R=this.i(T)>>>16,y=this.i(T)&65535,Je=E.i(v)>>>16,Xn=E.i(v)&65535;I[2*T+2*v]+=y*Xn,j(I,2*T+2*v),I[2*T+2*v+1]+=R*Xn,j(I,2*T+2*v+1),I[2*T+2*v+1]+=y*Je,j(I,2*T+2*v+1),I[2*T+2*v+2]+=R*Je,j(I,2*T+2*v+2)}for(T=0;T<p;T++)I[T]=I[2*T+1]<<16|I[2*T];for(T=p;T<2*p;T++)I[T]=0;return new a(I,0)};function j(E,p){for(;(E[p]&65535)!=E[p];)E[p+1]+=E[p]>>>16,E[p]&=65535,p++}function B(E,p){this.g=E,this.h=p}function $(E,p){if(C(p))throw Error("division by zero");if(C(E))return new B(g,g);if(N(E))return p=$(V(E),p),new B(V(p.g),V(p.h));if(N(p))return p=$(E,V(p)),new B(V(p.g),p.h);if(30<E.g.length){if(N(E)||N(p))throw Error("slowDivide_ only works with positive integers.");for(var I=_,T=p;0>=T.l(E);)I=Z(I),T=Z(T);var v=K(I,1),R=K(T,1);for(T=K(T,2),I=K(I,2);!C(T);){var y=R.add(T);0>=y.l(E)&&(v=v.add(I),R=y),T=K(T,1),I=K(I,1)}return p=q(E,v.j(p)),new B(v,p)}for(v=g;0<=E.l(p);){for(I=Math.max(1,Math.floor(E.m()/p.m())),T=Math.ceil(Math.log(I)/Math.LN2),T=48>=T?1:Math.pow(2,T-48),R=h(I),y=R.j(p);N(y)||0<y.l(E);)I-=T,R=h(I),y=R.j(p);C(R)&&(R=_),v=v.add(R),E=q(E,y)}return new B(v,E)}r.A=function(E){return $(this,E).h},r.and=function(E){for(var p=Math.max(this.g.length,E.g.length),I=[],T=0;T<p;T++)I[T]=this.i(T)&E.i(T);return new a(I,this.h&E.h)},r.or=function(E){for(var p=Math.max(this.g.length,E.g.length),I=[],T=0;T<p;T++)I[T]=this.i(T)|E.i(T);return new a(I,this.h|E.h)},r.xor=function(E){for(var p=Math.max(this.g.length,E.g.length),I=[],T=0;T<p;T++)I[T]=this.i(T)^E.i(T);return new a(I,this.h^E.h)};function Z(E){for(var p=E.g.length+1,I=[],T=0;T<p;T++)I[T]=E.i(T)<<1|E.i(T-1)>>>31;return new a(I,E.h)}function K(E,p){var I=p>>5;p%=32;for(var T=E.g.length-I,v=[],R=0;R<T;R++)v[R]=0<p?E.i(R+I)>>>p|E.i(R+I+1)<<32-p:E.i(R+I);return new a(v,E.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,fl=n,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=f,Qt=a}).apply(typeof zu<"u"?zu:typeof self<"u"?self:typeof window<"u"?window:{});var ws=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ml,Er,gl,Cs,co,pl,_l,yl;(function(){var r,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,l,d){return o==Array.prototype||o==Object.prototype||(o[l]=d.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof ws=="object"&&ws];for(var l=0;l<o.length;++l){var d=o[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var n=t(this);function s(o,l){if(l)e:{var d=n;o=o.split(".");for(var m=0;m<o.length-1;m++){var A=o[m];if(!(A in d))break e;d=d[A]}o=o[o.length-1],m=d[o],l=l(m),l!=m&&l!=null&&e(d,o,{configurable:!0,writable:!0,value:l})}}function i(o,l){o instanceof String&&(o+="");var d=0,m=!1,A={next:function(){if(!m&&d<o.length){var S=d++;return{value:l(S,o[S]),done:!1}}return m=!0,{done:!0,value:void 0}}};return A[Symbol.iterator]=function(){return A},A}s("Array.prototype.values",function(o){return o||function(){return i(this,function(l,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},u=this||self;function c(o){var l=typeof o;return l=l!="object"?l:o?Array.isArray(o)?"array":l:"null",l=="array"||l=="object"&&typeof o.length=="number"}function h(o){var l=typeof o;return l=="object"&&o!=null||l=="function"}function f(o,l,d){return o.call.apply(o.bind,arguments)}function g(o,l,d){if(!o)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var A=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(A,m),o.apply(l,A)}}return function(){return o.apply(l,arguments)}}function _(o,l,d){return _=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:g,_.apply(null,arguments)}function b(o,l){var d=Array.prototype.slice.call(arguments,1);return function(){var m=d.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function C(o,l){function d(){}d.prototype=l.prototype,o.aa=l.prototype,o.prototype=new d,o.prototype.constructor=o,o.Qb=function(m,A,S){for(var M=Array(arguments.length-2),re=2;re<arguments.length;re++)M[re-2]=arguments[re];return l.prototype[A].apply(m,M)}}function N(o){const l=o.length;if(0<l){const d=Array(l);for(let m=0;m<l;m++)d[m]=o[m];return d}return[]}function V(o,l){for(let d=1;d<arguments.length;d++){const m=arguments[d];if(c(m)){const A=o.length||0,S=m.length||0;o.length=A+S;for(let M=0;M<S;M++)o[A+M]=m[M]}else o.push(m)}}class q{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function j(o){return/^[\s\xa0]*$/.test(o)}function B(){var o=u.navigator;return o&&(o=o.userAgent)?o:""}function $(o){return $[" "](o),o}$[" "]=function(){};var Z=B().indexOf("Gecko")!=-1&&!(B().toLowerCase().indexOf("webkit")!=-1&&B().indexOf("Edge")==-1)&&!(B().indexOf("Trident")!=-1||B().indexOf("MSIE")!=-1)&&B().indexOf("Edge")==-1;function K(o,l,d){for(const m in o)l.call(d,o[m],m,o)}function E(o,l){for(const d in o)l.call(void 0,o[d],d,o)}function p(o){const l={};for(const d in o)l[d]=o[d];return l}const I="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(o,l){let d,m;for(let A=1;A<arguments.length;A++){m=arguments[A];for(d in m)o[d]=m[d];for(let S=0;S<I.length;S++)d=I[S],Object.prototype.hasOwnProperty.call(m,d)&&(o[d]=m[d])}}function v(o){var l=1;o=o.split(":");const d=[];for(;0<l&&o.length;)d.push(o.shift()),l--;return o.length&&d.push(o.join(":")),d}function R(o){u.setTimeout(()=>{throw o},0)}function y(){var o=Ai;let l=null;return o.g&&(l=o.g,o.g=o.g.next,o.g||(o.h=null),l.next=null),l}class Je{constructor(){this.h=this.g=null}add(l,d){const m=Xn.get();m.set(l,d),this.h?this.h.next=m:this.g=m,this.h=m}}var Xn=new q(()=>new jd,o=>o.reset());class jd{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let Zn,er=!1,Ai=new Je,Na=()=>{const o=u.Promise.resolve(void 0);Zn=()=>{o.then(zd)}};var zd=()=>{for(var o;o=y();){try{o.h.call(o.g)}catch(d){R(d)}var l=Xn;l.j(o),100>l.h&&(l.h++,o.next=l.g,l.g=o)}er=!1};function at(){this.s=this.s,this.C=this.C}at.prototype.s=!1,at.prototype.ma=function(){this.s||(this.s=!0,this.N())},at.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Pe(o,l){this.type=o,this.g=this.target=l,this.defaultPrevented=!1}Pe.prototype.h=function(){this.defaultPrevented=!0};var Gd=function(){if(!u.addEventListener||!Object.defineProperty)return!1;var o=!1,l=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const d=()=>{};u.addEventListener("test",d,l),u.removeEventListener("test",d,l)}catch{}return o}();function tr(o,l){if(Pe.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var d=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=l,l=o.relatedTarget){if(Z){e:{try{$(l.nodeName);var A=!0;break e}catch{}A=!1}A||(l=null)}}else d=="mouseover"?l=o.fromElement:d=="mouseout"&&(l=o.toElement);this.relatedTarget=l,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:Kd[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&tr.aa.h.call(this)}}C(tr,Pe);var Kd={2:"touch",3:"pen",4:"mouse"};tr.prototype.h=function(){tr.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ss="closure_listenable_"+(1e6*Math.random()|0),$d=0;function Qd(o,l,d,m,A){this.listener=o,this.proxy=null,this.src=l,this.type=d,this.capture=!!m,this.ha=A,this.key=++$d,this.da=this.fa=!1}function is(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function os(o){this.src=o,this.g={},this.h=0}os.prototype.add=function(o,l,d,m,A){var S=o.toString();o=this.g[S],o||(o=this.g[S]=[],this.h++);var M=Ri(o,l,m,A);return-1<M?(l=o[M],d||(l.fa=!1)):(l=new Qd(l,this.src,S,!!m,A),l.fa=d,o.push(l)),l};function bi(o,l){var d=l.type;if(d in o.g){var m=o.g[d],A=Array.prototype.indexOf.call(m,l,void 0),S;(S=0<=A)&&Array.prototype.splice.call(m,A,1),S&&(is(l),o.g[d].length==0&&(delete o.g[d],o.h--))}}function Ri(o,l,d,m){for(var A=0;A<o.length;++A){var S=o[A];if(!S.da&&S.listener==l&&S.capture==!!d&&S.ha==m)return A}return-1}var Pi="closure_lm_"+(1e6*Math.random()|0),Si={};function ka(o,l,d,m,A){if(Array.isArray(l)){for(var S=0;S<l.length;S++)ka(o,l[S],d,m,A);return null}return d=Fa(d),o&&o[ss]?o.K(l,d,h(m)?!!m.capture:!1,A):Wd(o,l,d,!1,m,A)}function Wd(o,l,d,m,A,S){if(!l)throw Error("Invalid event type");var M=h(A)?!!A.capture:!!A,re=Ci(o);if(re||(o[Pi]=re=new os(o)),d=re.add(l,d,m,M,S),d.proxy)return d;if(m=Hd(),d.proxy=m,m.src=o,m.listener=d,o.addEventListener)Gd||(A=M),A===void 0&&(A=!1),o.addEventListener(l.toString(),m,A);else if(o.attachEvent)o.attachEvent(Oa(l.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return d}function Hd(){function o(d){return l.call(o.src,o.listener,d)}const l=Jd;return o}function Ma(o,l,d,m,A){if(Array.isArray(l))for(var S=0;S<l.length;S++)Ma(o,l[S],d,m,A);else m=h(m)?!!m.capture:!!m,d=Fa(d),o&&o[ss]?(o=o.i,l=String(l).toString(),l in o.g&&(S=o.g[l],d=Ri(S,d,m,A),-1<d&&(is(S[d]),Array.prototype.splice.call(S,d,1),S.length==0&&(delete o.g[l],o.h--)))):o&&(o=Ci(o))&&(l=o.g[l.toString()],o=-1,l&&(o=Ri(l,d,m,A)),(d=-1<o?l[o]:null)&&Vi(d))}function Vi(o){if(typeof o!="number"&&o&&!o.da){var l=o.src;if(l&&l[ss])bi(l.i,o);else{var d=o.type,m=o.proxy;l.removeEventListener?l.removeEventListener(d,m,o.capture):l.detachEvent?l.detachEvent(Oa(d),m):l.addListener&&l.removeListener&&l.removeListener(m),(d=Ci(l))?(bi(d,o),d.h==0&&(d.src=null,l[Pi]=null)):is(o)}}}function Oa(o){return o in Si?Si[o]:Si[o]="on"+o}function Jd(o,l){if(o.da)o=!0;else{l=new tr(l,this);var d=o.listener,m=o.ha||o.src;o.fa&&Vi(o),o=d.call(m,l)}return o}function Ci(o){return o=o[Pi],o instanceof os?o:null}var Di="__closure_events_fn_"+(1e9*Math.random()>>>0);function Fa(o){return typeof o=="function"?o:(o[Di]||(o[Di]=function(l){return o.handleEvent(l)}),o[Di])}function Se(){at.call(this),this.i=new os(this),this.M=this,this.F=null}C(Se,at),Se.prototype[ss]=!0,Se.prototype.removeEventListener=function(o,l,d,m){Ma(this,o,l,d,m)};function Me(o,l){var d,m=o.F;if(m)for(d=[];m;m=m.F)d.push(m);if(o=o.M,m=l.type||l,typeof l=="string")l=new Pe(l,o);else if(l instanceof Pe)l.target=l.target||o;else{var A=l;l=new Pe(m,o),T(l,A)}if(A=!0,d)for(var S=d.length-1;0<=S;S--){var M=l.g=d[S];A=as(M,m,!0,l)&&A}if(M=l.g=o,A=as(M,m,!0,l)&&A,A=as(M,m,!1,l)&&A,d)for(S=0;S<d.length;S++)M=l.g=d[S],A=as(M,m,!1,l)&&A}Se.prototype.N=function(){if(Se.aa.N.call(this),this.i){var o=this.i,l;for(l in o.g){for(var d=o.g[l],m=0;m<d.length;m++)is(d[m]);delete o.g[l],o.h--}}this.F=null},Se.prototype.K=function(o,l,d,m){return this.i.add(String(o),l,!1,d,m)},Se.prototype.L=function(o,l,d,m){return this.i.add(String(o),l,!0,d,m)};function as(o,l,d,m){if(l=o.i.g[String(l)],!l)return!0;l=l.concat();for(var A=!0,S=0;S<l.length;++S){var M=l[S];if(M&&!M.da&&M.capture==d){var re=M.listener,Ae=M.ha||M.src;M.fa&&bi(o.i,M),A=re.call(Ae,m)!==!1&&A}}return A&&!m.defaultPrevented}function La(o,l,d){if(typeof o=="function")d&&(o=_(o,d));else if(o&&typeof o.handleEvent=="function")o=_(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:u.setTimeout(o,l||0)}function Ba(o){o.g=La(()=>{o.g=null,o.i&&(o.i=!1,Ba(o))},o.l);const l=o.h;o.h=null,o.m.apply(null,l)}class Yd extends at{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Ba(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function nr(o){at.call(this),this.h=o,this.g={}}C(nr,at);var Ua=[];function qa(o){K(o.g,function(l,d){this.g.hasOwnProperty(d)&&Vi(l)},o),o.g={}}nr.prototype.N=function(){nr.aa.N.call(this),qa(this)},nr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var xi=u.JSON.stringify,Xd=u.JSON.parse,Zd=class{stringify(o){return u.JSON.stringify(o,void 0)}parse(o){return u.JSON.parse(o,void 0)}};function Ni(){}Ni.prototype.h=null;function ja(o){return o.h||(o.h=o.i())}function za(){}var rr={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function ki(){Pe.call(this,"d")}C(ki,Pe);function Mi(){Pe.call(this,"c")}C(Mi,Pe);var Ot={},Ga=null;function us(){return Ga=Ga||new Se}Ot.La="serverreachability";function Ka(o){Pe.call(this,Ot.La,o)}C(Ka,Pe);function sr(o){const l=us();Me(l,new Ka(l))}Ot.STAT_EVENT="statevent";function $a(o,l){Pe.call(this,Ot.STAT_EVENT,o),this.stat=l}C($a,Pe);function Oe(o){const l=us();Me(l,new $a(l,o))}Ot.Ma="timingevent";function Qa(o,l){Pe.call(this,Ot.Ma,o),this.size=l}C(Qa,Pe);function ir(o,l){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){o()},l)}function or(){this.g=!0}or.prototype.xa=function(){this.g=!1};function ef(o,l,d,m,A,S){o.info(function(){if(o.g)if(S)for(var M="",re=S.split("&"),Ae=0;Ae<re.length;Ae++){var X=re[Ae].split("=");if(1<X.length){var Ve=X[0];X=X[1];var Ce=Ve.split("_");M=2<=Ce.length&&Ce[1]=="type"?M+(Ve+"="+X+"&"):M+(Ve+"=redacted&")}}else M=null;else M=S;return"XMLHTTP REQ ("+m+") [attempt "+A+"]: "+l+`
`+d+`
`+M})}function tf(o,l,d,m,A,S,M){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+A+"]: "+l+`
`+d+`
`+S+" "+M})}function cn(o,l,d,m){o.info(function(){return"XMLHTTP TEXT ("+l+"): "+rf(o,d)+(m?" "+m:"")})}function nf(o,l){o.info(function(){return"TIMEOUT: "+l})}or.prototype.info=function(){};function rf(o,l){if(!o.g)return l;if(!l)return null;try{var d=JSON.parse(l);if(d){for(o=0;o<d.length;o++)if(Array.isArray(d[o])){var m=d[o];if(!(2>m.length)){var A=m[1];if(Array.isArray(A)&&!(1>A.length)){var S=A[0];if(S!="noop"&&S!="stop"&&S!="close")for(var M=1;M<A.length;M++)A[M]=""}}}}return xi(d)}catch{return l}}var cs={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Wa={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Oi;function ls(){}C(ls,Ni),ls.prototype.g=function(){return new XMLHttpRequest},ls.prototype.i=function(){return{}},Oi=new ls;function ut(o,l,d,m){this.j=o,this.i=l,this.l=d,this.R=m||1,this.U=new nr(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Ha}function Ha(){this.i=null,this.g="",this.h=!1}var Ja={},Fi={};function Li(o,l,d){o.L=1,o.v=ms(Ye(l)),o.m=d,o.P=!0,Ya(o,null)}function Ya(o,l){o.F=Date.now(),hs(o),o.A=Ye(o.v);var d=o.A,m=o.R;Array.isArray(m)||(m=[String(m)]),hu(d.i,"t",m),o.C=0,d=o.j.J,o.h=new Ha,o.g=Vu(o.j,d?l:null,!o.m),0<o.O&&(o.M=new Yd(_(o.Y,o,o.g),o.O)),l=o.U,d=o.g,m=o.ca;var A="readystatechange";Array.isArray(A)||(A&&(Ua[0]=A.toString()),A=Ua);for(var S=0;S<A.length;S++){var M=ka(d,A[S],m||l.handleEvent,!1,l.h||l);if(!M)break;l.g[M.key]=M}l=o.H?p(o.H):{},o.m?(o.u||(o.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,l)):(o.u="GET",o.g.ea(o.A,o.u,null,l)),sr(),ef(o.i,o.u,o.A,o.l,o.R,o.m)}ut.prototype.ca=function(o){o=o.target;const l=this.M;l&&Xe(o)==3?l.j():this.Y(o)},ut.prototype.Y=function(o){try{if(o==this.g)e:{const Ce=Xe(this.g);var l=this.g.Ba();const dn=this.g.Z();if(!(3>Ce)&&(Ce!=3||this.g&&(this.h.h||this.g.oa()||yu(this.g)))){this.J||Ce!=4||l==7||(l==8||0>=dn?sr(3):sr(2)),Bi(this);var d=this.g.Z();this.X=d;t:if(Xa(this)){var m=yu(this.g);o="";var A=m.length,S=Xe(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Ft(this),ar(this);var M="";break t}this.h.i=new u.TextDecoder}for(l=0;l<A;l++)this.h.h=!0,o+=this.h.i.decode(m[l],{stream:!(S&&l==A-1)});m.length=0,this.h.g+=o,this.C=0,M=this.h.g}else M=this.g.oa();if(this.o=d==200,tf(this.i,this.u,this.A,this.l,this.R,Ce,d),this.o){if(this.T&&!this.K){t:{if(this.g){var re,Ae=this.g;if((re=Ae.g?Ae.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!j(re)){var X=re;break t}}X=null}if(d=X)cn(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ui(this,d);else{this.o=!1,this.s=3,Oe(12),Ft(this),ar(this);break e}}if(this.P){d=!0;let ze;for(;!this.J&&this.C<M.length;)if(ze=sf(this,M),ze==Fi){Ce==4&&(this.s=4,Oe(14),d=!1),cn(this.i,this.l,null,"[Incomplete Response]");break}else if(ze==Ja){this.s=4,Oe(15),cn(this.i,this.l,M,"[Invalid Chunk]"),d=!1;break}else cn(this.i,this.l,ze,null),Ui(this,ze);if(Xa(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Ce!=4||M.length!=0||this.h.h||(this.s=1,Oe(16),d=!1),this.o=this.o&&d,!d)cn(this.i,this.l,M,"[Invalid Chunked Response]"),Ft(this),ar(this);else if(0<M.length&&!this.W){this.W=!0;var Ve=this.j;Ve.g==this&&Ve.ba&&!Ve.M&&(Ve.j.info("Great, no buffering proxy detected. Bytes received: "+M.length),$i(Ve),Ve.M=!0,Oe(11))}}else cn(this.i,this.l,M,null),Ui(this,M);Ce==4&&Ft(this),this.o&&!this.J&&(Ce==4?bu(this.j,this):(this.o=!1,hs(this)))}else vf(this.g),d==400&&0<M.indexOf("Unknown SID")?(this.s=3,Oe(12)):(this.s=0,Oe(13)),Ft(this),ar(this)}}}catch{}finally{}};function Xa(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function sf(o,l){var d=o.C,m=l.indexOf(`
`,d);return m==-1?Fi:(d=Number(l.substring(d,m)),isNaN(d)?Ja:(m+=1,m+d>l.length?Fi:(l=l.slice(m,m+d),o.C=m+d,l)))}ut.prototype.cancel=function(){this.J=!0,Ft(this)};function hs(o){o.S=Date.now()+o.I,Za(o,o.I)}function Za(o,l){if(o.B!=null)throw Error("WatchDog timer not null");o.B=ir(_(o.ba,o),l)}function Bi(o){o.B&&(u.clearTimeout(o.B),o.B=null)}ut.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(nf(this.i,this.A),this.L!=2&&(sr(),Oe(17)),Ft(this),this.s=2,ar(this)):Za(this,this.S-o)};function ar(o){o.j.G==0||o.J||bu(o.j,o)}function Ft(o){Bi(o);var l=o.M;l&&typeof l.ma=="function"&&l.ma(),o.M=null,qa(o.U),o.g&&(l=o.g,o.g=null,l.abort(),l.ma())}function Ui(o,l){try{var d=o.j;if(d.G!=0&&(d.g==o||qi(d.h,o))){if(!o.K&&qi(d.h,o)&&d.G==3){try{var m=d.Da.g.parse(l)}catch{m=null}if(Array.isArray(m)&&m.length==3){var A=m;if(A[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<o.F)Es(d),ys(d);else break e;Ki(d),Oe(18)}}else d.za=A[1],0<d.za-d.T&&37500>A[2]&&d.F&&d.v==0&&!d.C&&(d.C=ir(_(d.Za,d),6e3));if(1>=nu(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else Bt(d,11)}else if((o.K||d.g==o)&&Es(d),!j(l))for(A=d.Da.g.parse(l),l=0;l<A.length;l++){let X=A[l];if(d.T=X[0],X=X[1],d.G==2)if(X[0]=="c"){d.K=X[1],d.ia=X[2];const Ve=X[3];Ve!=null&&(d.la=Ve,d.j.info("VER="+d.la));const Ce=X[4];Ce!=null&&(d.Aa=Ce,d.j.info("SVER="+d.Aa));const dn=X[5];dn!=null&&typeof dn=="number"&&0<dn&&(m=1.5*dn,d.L=m,d.j.info("backChannelRequestTimeoutMs_="+m)),m=d;const ze=o.g;if(ze){const vs=ze.g?ze.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(vs){var S=m.h;S.g||vs.indexOf("spdy")==-1&&vs.indexOf("quic")==-1&&vs.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(ji(S,S.h),S.h=null))}if(m.D){const Qi=ze.g?ze.g.getResponseHeader("X-HTTP-Session-Id"):null;Qi&&(m.ya=Qi,ie(m.I,m.D,Qi))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-o.F,d.j.info("Handshake RTT: "+d.R+"ms")),m=d;var M=o;if(m.qa=Su(m,m.J?m.ia:null,m.W),M.K){ru(m.h,M);var re=M,Ae=m.L;Ae&&(re.I=Ae),re.B&&(Bi(re),hs(re)),m.g=M}else wu(m);0<d.i.length&&Is(d)}else X[0]!="stop"&&X[0]!="close"||Bt(d,7);else d.G==3&&(X[0]=="stop"||X[0]=="close"?X[0]=="stop"?Bt(d,7):Gi(d):X[0]!="noop"&&d.l&&d.l.ta(X),d.v=0)}}sr(4)}catch{}}var of=class{constructor(o,l){this.g=o,this.map=l}};function eu(o){this.l=o||10,u.PerformanceNavigationTiming?(o=u.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function tu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function nu(o){return o.h?1:o.g?o.g.size:0}function qi(o,l){return o.h?o.h==l:o.g?o.g.has(l):!1}function ji(o,l){o.g?o.g.add(l):o.h=l}function ru(o,l){o.h&&o.h==l?o.h=null:o.g&&o.g.has(l)&&o.g.delete(l)}eu.prototype.cancel=function(){if(this.i=su(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function su(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let l=o.i;for(const d of o.g.values())l=l.concat(d.D);return l}return N(o.i)}function af(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var l=[],d=o.length,m=0;m<d;m++)l.push(o[m]);return l}l=[],d=0;for(m in o)l[d++]=o[m];return l}function uf(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var l=[];o=o.length;for(var d=0;d<o;d++)l.push(d);return l}l=[],d=0;for(const m in o)l[d++]=m;return l}}}function iu(o,l){if(o.forEach&&typeof o.forEach=="function")o.forEach(l,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,l,void 0);else for(var d=uf(o),m=af(o),A=m.length,S=0;S<A;S++)l.call(void 0,m[S],d&&d[S],o)}var ou=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function cf(o,l){if(o){o=o.split("&");for(var d=0;d<o.length;d++){var m=o[d].indexOf("="),A=null;if(0<=m){var S=o[d].substring(0,m);A=o[d].substring(m+1)}else S=o[d];l(S,A?decodeURIComponent(A.replace(/\+/g," ")):"")}}}function Lt(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Lt){this.h=o.h,ds(this,o.j),this.o=o.o,this.g=o.g,fs(this,o.s),this.l=o.l;var l=o.i,d=new lr;d.i=l.i,l.g&&(d.g=new Map(l.g),d.h=l.h),au(this,d),this.m=o.m}else o&&(l=String(o).match(ou))?(this.h=!1,ds(this,l[1]||"",!0),this.o=ur(l[2]||""),this.g=ur(l[3]||"",!0),fs(this,l[4]),this.l=ur(l[5]||"",!0),au(this,l[6]||"",!0),this.m=ur(l[7]||"")):(this.h=!1,this.i=new lr(null,this.h))}Lt.prototype.toString=function(){var o=[],l=this.j;l&&o.push(cr(l,uu,!0),":");var d=this.g;return(d||l=="file")&&(o.push("//"),(l=this.o)&&o.push(cr(l,uu,!0),"@"),o.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&o.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&o.push("/"),o.push(cr(d,d.charAt(0)=="/"?df:hf,!0))),(d=this.i.toString())&&o.push("?",d),(d=this.m)&&o.push("#",cr(d,mf)),o.join("")};function Ye(o){return new Lt(o)}function ds(o,l,d){o.j=d?ur(l,!0):l,o.j&&(o.j=o.j.replace(/:$/,""))}function fs(o,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);o.s=l}else o.s=null}function au(o,l,d){l instanceof lr?(o.i=l,gf(o.i,o.h)):(d||(l=cr(l,ff)),o.i=new lr(l,o.h))}function ie(o,l,d){o.i.set(l,d)}function ms(o){return ie(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function ur(o,l){return o?l?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function cr(o,l,d){return typeof o=="string"?(o=encodeURI(o).replace(l,lf),d&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function lf(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var uu=/[#\/\?@]/g,hf=/[#\?:]/g,df=/[#\?]/g,ff=/[#\?@]/g,mf=/#/g;function lr(o,l){this.h=this.g=null,this.i=o||null,this.j=!!l}function ct(o){o.g||(o.g=new Map,o.h=0,o.i&&cf(o.i,function(l,d){o.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}r=lr.prototype,r.add=function(o,l){ct(this),this.i=null,o=ln(this,o);var d=this.g.get(o);return d||this.g.set(o,d=[]),d.push(l),this.h+=1,this};function cu(o,l){ct(o),l=ln(o,l),o.g.has(l)&&(o.i=null,o.h-=o.g.get(l).length,o.g.delete(l))}function lu(o,l){return ct(o),l=ln(o,l),o.g.has(l)}r.forEach=function(o,l){ct(this),this.g.forEach(function(d,m){d.forEach(function(A){o.call(l,A,m,this)},this)},this)},r.na=function(){ct(this);const o=Array.from(this.g.values()),l=Array.from(this.g.keys()),d=[];for(let m=0;m<l.length;m++){const A=o[m];for(let S=0;S<A.length;S++)d.push(l[m])}return d},r.V=function(o){ct(this);let l=[];if(typeof o=="string")lu(this,o)&&(l=l.concat(this.g.get(ln(this,o))));else{o=Array.from(this.g.values());for(let d=0;d<o.length;d++)l=l.concat(o[d])}return l},r.set=function(o,l){return ct(this),this.i=null,o=ln(this,o),lu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[l]),this.h+=1,this},r.get=function(o,l){return o?(o=this.V(o),0<o.length?String(o[0]):l):l};function hu(o,l,d){cu(o,l),0<d.length&&(o.i=null,o.g.set(ln(o,l),N(d)),o.h+=d.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],l=Array.from(this.g.keys());for(var d=0;d<l.length;d++){var m=l[d];const S=encodeURIComponent(String(m)),M=this.V(m);for(m=0;m<M.length;m++){var A=S;M[m]!==""&&(A+="="+encodeURIComponent(String(M[m]))),o.push(A)}}return this.i=o.join("&")};function ln(o,l){return l=String(l),o.j&&(l=l.toLowerCase()),l}function gf(o,l){l&&!o.j&&(ct(o),o.i=null,o.g.forEach(function(d,m){var A=m.toLowerCase();m!=A&&(cu(this,m),hu(this,A,d))},o)),o.j=l}function pf(o,l){const d=new or;if(u.Image){const m=new Image;m.onload=b(lt,d,"TestLoadImage: loaded",!0,l,m),m.onerror=b(lt,d,"TestLoadImage: error",!1,l,m),m.onabort=b(lt,d,"TestLoadImage: abort",!1,l,m),m.ontimeout=b(lt,d,"TestLoadImage: timeout",!1,l,m),u.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else l(!1)}function _f(o,l){const d=new or,m=new AbortController,A=setTimeout(()=>{m.abort(),lt(d,"TestPingServer: timeout",!1,l)},1e4);fetch(o,{signal:m.signal}).then(S=>{clearTimeout(A),S.ok?lt(d,"TestPingServer: ok",!0,l):lt(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(A),lt(d,"TestPingServer: error",!1,l)})}function lt(o,l,d,m,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),m(d)}catch{}}function yf(){this.g=new Zd}function If(o,l,d){const m=d||"";try{iu(o,function(A,S){let M=A;h(A)&&(M=xi(A)),l.push(m+S+"="+encodeURIComponent(M))})}catch(A){throw l.push(m+"type="+encodeURIComponent("_badmap")),A}}function gs(o){this.l=o.Ub||null,this.j=o.eb||!1}C(gs,Ni),gs.prototype.g=function(){return new ps(this.l,this.j)},gs.prototype.i=function(o){return function(){return o}}({});function ps(o,l){Se.call(this),this.D=o,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(ps,Se),r=ps.prototype,r.open=function(o,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=l,this.readyState=1,dr(this)},r.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(l.body=o),(this.D||u).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,hr(this)),this.readyState=0},r.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,dr(this)),this.g&&(this.readyState=3,dr(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;du(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function du(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}r.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var l=o.value?o.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!o.done}))&&(this.response=this.responseText+=l)}o.done?hr(this):dr(this),this.readyState==3&&du(this)}},r.Ra=function(o){this.g&&(this.response=this.responseText=o,hr(this))},r.Qa=function(o){this.g&&(this.response=o,hr(this))},r.ga=function(){this.g&&hr(this)};function hr(o){o.readyState=4,o.l=null,o.j=null,o.v=null,dr(o)}r.setRequestHeader=function(o,l){this.u.append(o,l)},r.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,o.push(d[0]+": "+d[1]),d=l.next();return o.join(`\r
`)};function dr(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(ps.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function fu(o){let l="";return K(o,function(d,m){l+=m,l+=":",l+=d,l+=`\r
`}),l}function zi(o,l,d){e:{for(m in d){var m=!1;break e}m=!0}m||(d=fu(d),typeof o=="string"?d!=null&&encodeURIComponent(String(d)):ie(o,l,d))}function fe(o){Se.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(fe,Se);var Ef=/^https?$/i,Tf=["POST","PUT"];r=fe.prototype,r.Ha=function(o){this.J=o},r.ea=function(o,l,d,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);l=l?l.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Oi.g(),this.v=this.o?ja(this.o):ja(Oi),this.g.onreadystatechange=_(this.Ea,this);try{this.B=!0,this.g.open(l,String(o),!0),this.B=!1}catch(S){mu(this,S);return}if(o=d||"",d=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var A in m)d.set(A,m[A]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const S of m.keys())d.set(S,m.get(S));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(d.keys()).find(S=>S.toLowerCase()=="content-type"),A=u.FormData&&o instanceof u.FormData,!(0<=Array.prototype.indexOf.call(Tf,l,void 0))||m||A||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,M]of d)this.g.setRequestHeader(S,M);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{_u(this),this.u=!0,this.g.send(o),this.u=!1}catch(S){mu(this,S)}};function mu(o,l){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=l,o.m=5,gu(o),_s(o)}function gu(o){o.A||(o.A=!0,Me(o,"complete"),Me(o,"error"))}r.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,Me(this,"complete"),Me(this,"abort"),_s(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),_s(this,!0)),fe.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?pu(this):this.bb())},r.bb=function(){pu(this)};function pu(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Xe(o)!=4||o.Z()!=2)){if(o.u&&Xe(o)==4)La(o.Ea,0,o);else if(Me(o,"readystatechange"),Xe(o)==4){o.h=!1;try{const M=o.Z();e:switch(M){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var m;if(m=M===0){var A=String(o.D).match(ou)[1]||null;!A&&u.self&&u.self.location&&(A=u.self.location.protocol.slice(0,-1)),m=!Ef.test(A?A.toLowerCase():"")}d=m}if(d)Me(o,"complete"),Me(o,"success");else{o.m=6;try{var S=2<Xe(o)?o.g.statusText:""}catch{S=""}o.l=S+" ["+o.Z()+"]",gu(o)}}finally{_s(o)}}}}function _s(o,l){if(o.g){_u(o);const d=o.g,m=o.v[0]?()=>{}:null;o.g=null,o.v=null,l||Me(o,"ready");try{d.onreadystatechange=m}catch{}}}function _u(o){o.I&&(u.clearTimeout(o.I),o.I=null)}r.isActive=function(){return!!this.g};function Xe(o){return o.g?o.g.readyState:0}r.Z=function(){try{return 2<Xe(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(o){if(this.g){var l=this.g.responseText;return o&&l.indexOf(o)==0&&(l=l.substring(o.length)),Xd(l)}};function yu(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function vf(o){const l={};o=(o.g&&2<=Xe(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(j(o[m]))continue;var d=v(o[m]);const A=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const S=l[A]||[];l[A]=S,S.push(d)}E(l,function(m){return m.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function fr(o,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[o]||l}function Iu(o){this.Aa=0,this.i=[],this.j=new or,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=fr("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=fr("baseRetryDelayMs",5e3,o),this.cb=fr("retryDelaySeedMs",1e4,o),this.Wa=fr("forwardChannelMaxRetries",2,o),this.wa=fr("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new eu(o&&o.concurrentRequestLimit),this.Da=new yf,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=Iu.prototype,r.la=8,r.G=1,r.connect=function(o,l,d,m){Oe(0),this.W=o,this.H=l||{},d&&m!==void 0&&(this.H.OSID=d,this.H.OAID=m),this.F=this.X,this.I=Su(this,null,this.W),Is(this)};function Gi(o){if(Eu(o),o.G==3){var l=o.U++,d=Ye(o.I);if(ie(d,"SID",o.K),ie(d,"RID",l),ie(d,"TYPE","terminate"),mr(o,d),l=new ut(o,o.j,l),l.L=2,l.v=ms(Ye(d)),d=!1,u.navigator&&u.navigator.sendBeacon)try{d=u.navigator.sendBeacon(l.v.toString(),"")}catch{}!d&&u.Image&&(new Image().src=l.v,d=!0),d||(l.g=Vu(l.j,null),l.g.ea(l.v)),l.F=Date.now(),hs(l)}Pu(o)}function ys(o){o.g&&($i(o),o.g.cancel(),o.g=null)}function Eu(o){ys(o),o.u&&(u.clearTimeout(o.u),o.u=null),Es(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&u.clearTimeout(o.s),o.s=null)}function Is(o){if(!tu(o.h)&&!o.s){o.s=!0;var l=o.Ga;Zn||Na(),er||(Zn(),er=!0),Ai.add(l,o),o.B=0}}function wf(o,l){return nu(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=l.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=ir(_(o.Ga,o,l),Ru(o,o.B)),o.B++,!0)}r.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const A=new ut(this,this.j,o);let S=this.o;if(this.S&&(S?(S=p(S),T(S,this.S)):S=this.S),this.m!==null||this.O||(A.H=S,S=null),this.P)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var m=this.i[d];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(l+=m,4096<l){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=vu(this,A,l),d=Ye(this.I),ie(d,"RID",o),ie(d,"CVER",22),this.D&&ie(d,"X-HTTP-Session-Id",this.D),mr(this,d),S&&(this.O?l="headers="+encodeURIComponent(String(fu(S)))+"&"+l:this.m&&zi(d,this.m,S)),ji(this.h,A),this.Ua&&ie(d,"TYPE","init"),this.P?(ie(d,"$req",l),ie(d,"SID","null"),A.T=!0,Li(A,d,null)):Li(A,d,l),this.G=2}}else this.G==3&&(o?Tu(this,o):this.i.length==0||tu(this.h)||Tu(this))};function Tu(o,l){var d;l?d=l.l:d=o.U++;const m=Ye(o.I);ie(m,"SID",o.K),ie(m,"RID",d),ie(m,"AID",o.T),mr(o,m),o.m&&o.o&&zi(m,o.m,o.o),d=new ut(o,o.j,d,o.B+1),o.m===null&&(d.H=o.o),l&&(o.i=l.D.concat(o.i)),l=vu(o,d,1e3),d.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),ji(o.h,d),Li(d,m,l)}function mr(o,l){o.H&&K(o.H,function(d,m){ie(l,m,d)}),o.l&&iu({},function(d,m){ie(l,m,d)})}function vu(o,l,d){d=Math.min(o.i.length,d);var m=o.l?_(o.l.Na,o.l,o):null;e:{var A=o.i;let S=-1;for(;;){const M=["count="+d];S==-1?0<d?(S=A[0].g,M.push("ofs="+S)):S=0:M.push("ofs="+S);let re=!0;for(let Ae=0;Ae<d;Ae++){let X=A[Ae].g;const Ve=A[Ae].map;if(X-=S,0>X)S=Math.max(0,A[Ae].g-100),re=!1;else try{If(Ve,M,"req"+X+"_")}catch{m&&m(Ve)}}if(re){m=M.join("&");break e}}}return o=o.i.splice(0,d),l.D=o,m}function wu(o){if(!o.g&&!o.u){o.Y=1;var l=o.Fa;Zn||Na(),er||(Zn(),er=!0),Ai.add(l,o),o.v=0}}function Ki(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=ir(_(o.Fa,o),Ru(o,o.v)),o.v++,!0)}r.Fa=function(){if(this.u=null,Au(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=ir(_(this.ab,this),o)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Oe(10),ys(this),Au(this))};function $i(o){o.A!=null&&(u.clearTimeout(o.A),o.A=null)}function Au(o){o.g=new ut(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var l=Ye(o.qa);ie(l,"RID","rpc"),ie(l,"SID",o.K),ie(l,"AID",o.T),ie(l,"CI",o.F?"0":"1"),!o.F&&o.ja&&ie(l,"TO",o.ja),ie(l,"TYPE","xmlhttp"),mr(o,l),o.m&&o.o&&zi(l,o.m,o.o),o.L&&(o.g.I=o.L);var d=o.g;o=o.ia,d.L=1,d.v=ms(Ye(l)),d.m=null,d.P=!0,Ya(d,o)}r.Za=function(){this.C!=null&&(this.C=null,ys(this),Ki(this),Oe(19))};function Es(o){o.C!=null&&(u.clearTimeout(o.C),o.C=null)}function bu(o,l){var d=null;if(o.g==l){Es(o),$i(o),o.g=null;var m=2}else if(qi(o.h,l))d=l.D,ru(o.h,l),m=1;else return;if(o.G!=0){if(l.o)if(m==1){d=l.m?l.m.length:0,l=Date.now()-l.F;var A=o.B;m=us(),Me(m,new Qa(m,d)),Is(o)}else wu(o);else if(A=l.s,A==3||A==0&&0<l.X||!(m==1&&wf(o,l)||m==2&&Ki(o)))switch(d&&0<d.length&&(l=o.h,l.i=l.i.concat(d)),A){case 1:Bt(o,5);break;case 4:Bt(o,10);break;case 3:Bt(o,6);break;default:Bt(o,2)}}}function Ru(o,l){let d=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(d*=2),d*l}function Bt(o,l){if(o.j.info("Error code "+l),l==2){var d=_(o.fb,o),m=o.Xa;const A=!m;m=new Lt(m||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||ds(m,"https"),ms(m),A?pf(m.toString(),d):_f(m.toString(),d)}else Oe(2);o.G=0,o.l&&o.l.sa(l),Pu(o),Eu(o)}r.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Oe(2)):(this.j.info("Failed to ping google.com"),Oe(1))};function Pu(o){if(o.G=0,o.ka=[],o.l){const l=su(o.h);(l.length!=0||o.i.length!=0)&&(V(o.ka,l),V(o.ka,o.i),o.h.i.length=0,N(o.i),o.i.length=0),o.l.ra()}}function Su(o,l,d){var m=d instanceof Lt?Ye(d):new Lt(d);if(m.g!="")l&&(m.g=l+"."+m.g),fs(m,m.s);else{var A=u.location;m=A.protocol,l=l?l+"."+A.hostname:A.hostname,A=+A.port;var S=new Lt(null);m&&ds(S,m),l&&(S.g=l),A&&fs(S,A),d&&(S.l=d),m=S}return d=o.D,l=o.ya,d&&l&&ie(m,d,l),ie(m,"VER",o.la),mr(o,m),m}function Vu(o,l,d){if(l&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=o.Ca&&!o.pa?new fe(new gs({eb:d})):new fe(o.pa),l.Ha(o.J),l}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Cu(){}r=Cu.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function Ts(){}Ts.prototype.g=function(o,l){return new Ue(o,l)};function Ue(o,l){Se.call(this),this.g=new Iu(l),this.l=o,this.h=l&&l.messageUrlParams||null,o=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(o?o["X-WebChannel-Content-Type"]=l.messageContentType:o={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(o?o["X-WebChannel-Client-Profile"]=l.va:o={"X-WebChannel-Client-Profile":l.va}),this.g.S=o,(o=l&&l.Sb)&&!j(o)&&(this.g.m=o),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!j(l)&&(this.g.D=l,o=this.h,o!==null&&l in o&&(o=this.h,l in o&&delete o[l])),this.j=new hn(this)}C(Ue,Se),Ue.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Ue.prototype.close=function(){Gi(this.g)},Ue.prototype.o=function(o){var l=this.g;if(typeof o=="string"){var d={};d.__data__=o,o=d}else this.u&&(d={},d.__data__=xi(o),o=d);l.i.push(new of(l.Ya++,o)),l.G==3&&Is(l)},Ue.prototype.N=function(){this.g.l=null,delete this.j,Gi(this.g),delete this.g,Ue.aa.N.call(this)};function Du(o){ki.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var l=o.__sm__;if(l){e:{for(const d in l){o=d;break e}o=void 0}(this.i=o)&&(o=this.i,l=l!==null&&o in l?l[o]:void 0),this.data=l}else this.data=o}C(Du,ki);function xu(){Mi.call(this),this.status=1}C(xu,Mi);function hn(o){this.g=o}C(hn,Cu),hn.prototype.ua=function(){Me(this.g,"a")},hn.prototype.ta=function(o){Me(this.g,new Du(o))},hn.prototype.sa=function(o){Me(this.g,new xu)},hn.prototype.ra=function(){Me(this.g,"b")},Ts.prototype.createWebChannel=Ts.prototype.g,Ue.prototype.send=Ue.prototype.o,Ue.prototype.open=Ue.prototype.m,Ue.prototype.close=Ue.prototype.close,yl=function(){return new Ts},_l=function(){return us()},pl=Ot,co={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},cs.NO_ERROR=0,cs.TIMEOUT=8,cs.HTTP_ERROR=6,Cs=cs,Wa.COMPLETE="complete",gl=Wa,za.EventType=rr,rr.OPEN="a",rr.CLOSE="b",rr.ERROR="c",rr.MESSAGE="d",Se.prototype.listen=Se.prototype.K,Er=za,fe.prototype.listenOnce=fe.prototype.L,fe.prototype.getLastError=fe.prototype.Ka,fe.prototype.getLastErrorCode=fe.prototype.Ba,fe.prototype.getStatus=fe.prototype.Z,fe.prototype.getResponseJson=fe.prototype.Oa,fe.prototype.getResponseText=fe.prototype.oa,fe.prototype.send=fe.prototype.ea,fe.prototype.setWithCredentials=fe.prototype.Ha,ml=fe}).apply(typeof ws<"u"?ws:typeof self<"u"?self:typeof window<"u"?window:{});const Gu="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ee.UNAUTHENTICATED=new Ee(null),Ee.GOOGLE_CREDENTIALS=new Ee("google-credentials-uid"),Ee.FIRST_PARTY=new Ee("first-party-uid"),Ee.MOCK_USER=new Ee("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Un="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et=new ul("@firebase/firestore");function _n(){return Et.logLevel}function eg(r){Et.setLogLevel(r)}function x(r,...e){if(Et.logLevel<=Y.DEBUG){const t=e.map(No);Et.debug(`Firestore (${Un}): ${r}`,...t)}}function ge(r,...e){if(Et.logLevel<=Y.ERROR){const t=e.map(No);Et.error(`Firestore (${Un}): ${r}`,...t)}}function qe(r,...e){if(Et.logLevel<=Y.WARN){const t=e.map(No);Et.warn(`Firestore (${Un}): ${r}`,...t)}}function No(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F(r="Unexpected state"){const e=`FIRESTORE (${Un}) INTERNAL ASSERTION FAILED: `+r;throw ge(e),new Error(e)}function L(r,e){r||F()}function tg(r,e){r||F()}function k(r,e){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class D extends Bn{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Il{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class El{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ee.UNAUTHENTICATED))}shutdown(){}}class ng{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class rg{constructor(e){this.t=e,this.currentUser=Ee.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){L(this.o===void 0);let n=this.i;const s=c=>this.i!==n?(n=this.i,t(c)):Promise.resolve();let i=new Te;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Te,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},u=c=>{x("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>u(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?u(c):(x("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Te)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(n=>this.i!==e?(x("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(L(typeof n.accessToken=="string"),new Il(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return L(e===null||typeof e=="string"),new Ee(e)}}class sg{constructor(e,t,n){this.l=e,this.h=t,this.P=n,this.type="FirstParty",this.user=Ee.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class ig{constructor(e,t,n){this.l=e,this.h=t,this.P=n}getToken(){return Promise.resolve(new sg(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Ee.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Tl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class og{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){L(this.o===void 0);const n=i=>{i.error!=null&&x("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,x("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>n(i))};const s=i=>{x("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):x("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(L(typeof t.token=="string"),this.R=t.token,new Tl(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}class ag{getToken(){return Promise.resolve(new Tl(""))}invalidateToken(){}start(e,t){}shutdown(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ug(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let n="";for(;n.length<20;){const s=ug(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%e.length))}return n}}function z(r,e){return r<e?-1:r>e?1:0}function An(r,e,t){return r.length===e.length&&r.every((n,s)=>t(n,e[s]))}function vl(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new D(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new D(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new D(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new D(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return le.fromMillis(Date.now())}static fromDate(e){return le.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor(1e6*(e-1e3*t));return new le(t,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?z(this.nanoseconds,e.nanoseconds):z(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{constructor(e){this.timestamp=e}static fromTimestamp(e){return new U(e)}static min(){return new U(new le(0,0))}static max(){return new U(new le(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nr{constructor(e,t,n){t===void 0?t=0:t>e.length&&F(),n===void 0?n=e.length-t:n>e.length-t&&F(),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return Nr.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Nr?e.forEach(n=>{t.push(n)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=e.get(s),a=t.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class W extends Nr{construct(e,t,n){return new W(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new D(P.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(s=>s.length>0))}return new W(t)}static emptyPath(){return new W([])}}const cg=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ae extends Nr{construct(e,t,n){return new ae(e,t,n)}static isValidIdentifier(e){return cg.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ae.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ae(["__name__"])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new D(P.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let a=!1;for(;s<e.length;){const u=e[s];if(u==="\\"){if(s+1===e.length)throw new D(P.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new D(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=c,s+=2}else u==="`"?(a=!a,s++):u!=="."||a?(n+=u,s++):(i(),s++)}if(i(),a)throw new D(P.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new ae(t)}static emptyPath(){return new ae([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(e){this.path=e}static fromPath(e){return new O(W.fromString(e))}static fromName(e){return new O(W.fromString(e).popFirst(5))}static empty(){return new O(W.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&W.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return W.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new O(new W(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bn{constructor(e,t,n,s){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=s}}function lo(r){return r.fields.find(e=>e.kind===2)}function jt(r){return r.fields.filter(e=>e.kind!==2)}function lg(r,e){let t=z(r.collectionGroup,e.collectionGroup);if(t!==0)return t;for(let n=0;n<Math.min(r.fields.length,e.fields.length);++n)if(t=hg(r.fields[n],e.fields[n]),t!==0)return t;return z(r.fields.length,e.fields.length)}bn.UNKNOWN_ID=-1;class Wt{constructor(e,t){this.fieldPath=e,this.kind=t}}function hg(r,e){const t=ae.comparator(r.fieldPath,e.fieldPath);return t!==0?t:z(r.kind,e.kind)}class Rn{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new Rn(0,je.min())}}function wl(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=U.fromTimestamp(n===1e9?new le(t+1,0):new le(t,n));return new je(s,O.empty(),e)}function Al(r){return new je(r.readTime,r.key,-1)}class je{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new je(U.min(),O.empty(),-1)}static max(){return new je(U.max(),O.empty(),-1)}}function Mo(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=O.comparator(r.documentKey,e.documentKey),t!==0?t:z(r.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bl="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Rl{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vt(r){if(r.code!==P.FAILED_PRECONDITION||r.message!==bl)throw r;x("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&F(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new w((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof w?t:w.resolve(t)}catch(t){return w.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):w.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):w.reject(t)}static resolve(e){return new w((t,n)=>{t(e)})}static reject(e){return new w((t,n)=>{n(e)})}static waitFor(e){return new w((t,n)=>{let s=0,i=0,a=!1;e.forEach(u=>{++s,u.next(()=>{++i,a&&i===s&&t()},c=>n(c))}),a=!0,i===s&&t()})}static or(e){let t=w.resolve(!1);for(const n of e)t=t.next(s=>s?w.resolve(s):n());return t}static forEach(e,t){const n=[];return e.forEach((s,i)=>{n.push(t.call(this,s,i))}),this.waitFor(n)}static mapArray(e,t){return new w((n,s)=>{const i=e.length,a=new Array(i);let u=0;for(let c=0;c<i;c++){const h=c;t(e[h]).next(f=>{a[h]=f,++u,u===i&&n(a)},f=>s(f))}})}static doWhile(e,t){return new w((n,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):n()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ni{constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.V=new Te,this.transaction.oncomplete=()=>{this.V.resolve()},this.transaction.onabort=()=>{t.error?this.V.reject(new br(e,t.error)):this.V.resolve()},this.transaction.onerror=n=>{const s=Oo(n.target.error);this.V.reject(new br(e,s))}}static open(e,t,n,s){try{return new ni(t,e.transaction(s,n))}catch(i){throw new br(t,i)}}get m(){return this.V.promise}abort(e){e&&this.V.reject(e),this.aborted||(x("SimpleDb","Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}g(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new fg(t)}}class Qe{constructor(e,t,n){this.name=e,this.version=t,this.p=n,Qe.S(wn())===12.2&&ge("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}static delete(e){return x("SimpleDb","Removing database:",e),zt(window.indexedDB.deleteDatabase(e)).toPromise()}static D(){if(!ol())return!1;if(Qe.v())return!0;const e=wn(),t=Qe.S(e),n=0<t&&t<10,s=Pl(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||i)}static v(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.C)==="YES"}static F(e,t){return e.store(t)}static S(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}async M(e){return this.db||(x("SimpleDb","Opening database:",this.name),this.db=await new Promise((t,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const a=i.target.result;t(a)},s.onblocked=()=>{n(new br(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const a=i.target.error;a.name==="VersionError"?n(new D(P.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):a.name==="InvalidStateError"?n(new D(P.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+a)):n(new br(e,a))},s.onupgradeneeded=i=>{x("SimpleDb",'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const a=i.target.result;this.p.O(a,s.transaction,i.oldVersion,this.version).next(()=>{x("SimpleDb","Database upgrade to version "+this.version+" complete")})}})),this.N&&(this.db.onversionchange=t=>this.N(t)),this.db}L(e){this.N=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,s){const i=t==="readonly";let a=0;for(;;){++a;try{this.db=await this.M(e);const u=ni.open(this.db,e,i?"readonly":"readwrite",n),c=s(u).next(h=>(u.g(),h)).catch(h=>(u.abort(h),w.reject(h))).toPromise();return c.catch(()=>{}),await u.m,c}catch(u){const c=u,h=c.name!=="FirebaseError"&&a<3;if(x("SimpleDb","Transaction failed with error:",c.message,"Retrying:",h),this.close(),!h)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Pl(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class dg{constructor(e){this.B=e,this.k=!1,this.q=null}get isDone(){return this.k}get K(){return this.q}set cursor(e){this.B=e}done(){this.k=!0}$(e){this.q=e}delete(){return zt(this.B.delete())}}class br extends D{constructor(e,t){super(P.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Ct(r){return r.name==="IndexedDbTransactionError"}class fg{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(x("SimpleDb","PUT",this.store.name,e,t),n=this.store.put(t,e)):(x("SimpleDb","PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),zt(n)}add(e){return x("SimpleDb","ADD",this.store.name,e,e),zt(this.store.add(e))}get(e){return zt(this.store.get(e)).next(t=>(t===void 0&&(t=null),x("SimpleDb","GET",this.store.name,e,t),t))}delete(e){return x("SimpleDb","DELETE",this.store.name,e),zt(this.store.delete(e))}count(){return x("SimpleDb","COUNT",this.store.name),zt(this.store.count())}U(e,t){const n=this.options(e,t),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new w((a,u)=>{i.onerror=c=>{u(c.target.error)},i.onsuccess=c=>{a(c.target.result)}})}{const i=this.cursor(n),a=[];return this.W(i,(u,c)=>{a.push(c)}).next(()=>a)}}G(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new w((s,i)=>{n.onerror=a=>{i(a.target.error)},n.onsuccess=a=>{s(a.target.result)}})}j(e,t){x("SimpleDb","DELETE ALL",this.store.name);const n=this.options(e,t);n.H=!1;const s=this.cursor(n);return this.W(s,(i,a,u)=>u.delete())}J(e,t){let n;t?n=e:(n={},t=e);const s=this.cursor(n);return this.W(s,t)}Y(e){const t=this.cursor({});return new w((n,s)=>{t.onerror=i=>{const a=Oo(i.target.error);s(a)},t.onsuccess=i=>{const a=i.target.result;a?e(a.primaryKey,a.value).next(u=>{u?a.continue():n()}):n()}})}W(e,t){const n=[];return new w((s,i)=>{e.onerror=a=>{i(a.target.error)},e.onsuccess=a=>{const u=a.target.result;if(!u)return void s();const c=new dg(u),h=t(u.primaryKey,u.value,c);if(h instanceof w){const f=h.catch(g=>(c.done(),w.reject(g)));n.push(f)}c.isDone?s():c.K===null?u.continue():u.continue(c.K)}}).next(()=>w.waitFor(n))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.H?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function zt(r){return new w((e,t)=>{r.onsuccess=n=>{const s=n.target.result;e(s)},r.onerror=n=>{const s=Oo(n.target.error);t(s)}})}let Ku=!1;function Oo(r){const e=Qe.S(wn());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new D("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Ku||(Ku=!0,setTimeout(()=>{throw n},0)),n}}return r}class mg{constructor(e,t){this.asyncQueue=e,this.Z=t,this.task=null}start(){this.X(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}X(e){x("IndexBackfiller",`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{x("IndexBackfiller",`Documents written: ${await this.Z.ee()}`)}catch(t){Ct(t)?x("IndexBackfiller","Ignoring IndexedDB error during index backfill: ",t):await Vt(t)}await this.X(6e4)})}}class gg{constructor(e,t){this.localStore=e,this.persistence=t}async ee(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.te(t,e))}te(e,t){const n=new Set;let s=t,i=!0;return w.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(a=>{if(a!==null&&!n.has(a))return x("IndexBackfiller",`Processing collection: ${a}`),this.ne(e,a,s).next(u=>{s-=u,n.add(a)});i=!1})).next(()=>t-s)}ne(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(s=>this.localStore.localDocuments.getNextDocuments(e,t,s,n).next(i=>{const a=i.changes;return this.localStore.indexManager.updateIndexEntries(e,a).next(()=>this.re(s,i)).next(u=>(x("IndexBackfiller",`Updating offset: ${u}`),this.localStore.indexManager.updateCollectionGroup(e,t,u))).next(()=>a.size)}))}re(e,t){let n=e;return t.changes.forEach((s,i)=>{const a=Al(i);Mo(a,n)>0&&(n=a)}),new je(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.ie(n),this.se=n=>t.writeSequenceNumber(n))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Fe.oe=-1;function zr(r){return r==null}function kr(r){return r===0&&1/r==-1/0}function Sl(r){return typeof r=="number"&&Number.isInteger(r)&&!kr(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ne(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=$u(e)),e=pg(r.get(t),e);return $u(e)}function pg(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case"":t+="";break;default:t+=i}}return t}function $u(r){return r+""}function Ke(r){const e=r.length;if(L(e>=2),e===2)return L(r.charAt(0)===""&&r.charAt(1)===""),W.emptyPath();const t=e-2,n=[];let s="";for(let i=0;i<e;){const a=r.indexOf("",i);switch((a<0||a>t)&&F(),r.charAt(a+1)){case"":const u=r.substring(i,a);let c;s.length===0?c=u:(s+=u,c=s,s=""),n.push(c);break;case"":s+=r.substring(i,a),s+="\0";break;case"":s+=r.substring(i,a+1);break;default:F()}i=a+2}return new W(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qu=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ds(r,e){return[r,Ne(e)]}function Vl(r,e,t){return[r,Ne(e),t]}const _g={},yg=["prefixPath","collectionGroup","readTime","documentId"],Ig=["prefixPath","collectionGroup","documentId"],Eg=["collectionGroup","readTime","prefixPath","documentId"],Tg=["canonicalId","targetId"],vg=["targetId","path"],wg=["path","targetId"],Ag=["collectionId","parent"],bg=["indexId","uid"],Rg=["uid","sequenceNumber"],Pg=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Sg=["indexId","uid","orderedDocumentKey"],Vg=["userId","collectionPath","documentId"],Cg=["userId","collectionPath","largestBatchId"],Dg=["userId","collectionGroup","largestBatchId"],Cl=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],xg=[...Cl,"documentOverlays"],Dl=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],xl=Dl,Fo=[...xl,"indexConfiguration","indexState","indexEntries"],Ng=Fo,kg=[...Fo,"globals"];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ho extends Rl{constructor(e,t){super(),this._e=e,this.currentSequenceNumber=t}}function ye(r,e){const t=k(r);return Qe.F(t._e,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wu(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function Dt(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function Nl(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function kl(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se{constructor(e,t){this.comparator=e,this.root=t||be.EMPTY}insert(e,t){return new se(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,be.BLACK,null,null))}remove(e){return new se(this.comparator,this.root.remove(e,this.comparator).copy(null,null,be.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new As(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new As(this.root,e,this.comparator,!1)}getReverseIterator(){return new As(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new As(this.root,e,this.comparator,!0)}}class As{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class be{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??be.RED,this.left=s??be.EMPTY,this.right=i??be.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new be(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return be.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return be.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,be.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,be.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw F();const e=this.left.check();if(e!==this.right.check())throw F();return e+(this.isRed()?0:1)}}be.EMPTY=null,be.RED=!0,be.BLACK=!1;be.EMPTY=new class{constructor(){this.size=0}get key(){throw F()}get value(){throw F()}get color(){throw F()}get left(){throw F()}get right(){throw F()}copy(e,t,n,s,i){return this}insert(e,t,n){return new be(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class te{constructor(e){this.comparator=e,this.data=new se(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Hu(this.data.getIterator())}getIteratorFrom(e){return new Hu(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(n=>{t=t.add(n)}),t}isEqual(e){if(!(e instanceof te)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new te(this.comparator);return t.data=e,t}}class Hu{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function fn(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Le{constructor(e){this.fields=e,e.sort(ae.comparator)}static empty(){return new Le([])}unionWith(e){let t=new te(ae.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new Le(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return An(this.fields,e.fields,(t,n)=>t.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ml extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mg(){return typeof atob<"u"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Ml("Invalid base64 string: "+i):i}}(e);return new de(t)}static fromUint8Array(e){const t=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new de(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return z(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}de.EMPTY_BYTE_STRING=new de("");const Og=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function tt(r){if(L(!!r),typeof r=="string"){let e=0;const t=Og.exec(r);if(L(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:ue(r.seconds),nanos:ue(r.nanos)}}function ue(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function nt(r){return typeof r=="string"?de.fromBase64String(r):de.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ri(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function si(r){const e=r.mapValue.fields.__previous_value__;return ri(e)?si(e):e}function Mr(r){const e=tt(r.mapValue.fields.__local_write_time__.timestampValue);return new le(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fg{constructor(e,t,n,s,i,a,u,c,h){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=c,this.useFetchStreams=h}}class Tt{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Tt("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Tt&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pt={mapValue:{fields:{__type__:{stringValue:"__max__"}}}},xs={nullValue:"NULL_VALUE"};function vt(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?ri(r)?4:Ol(r)?9007199254740991:ii(r)?10:11:F()}function He(r,e){if(r===e)return!0;const t=vt(r);if(t!==vt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return Mr(r).isEqual(Mr(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=tt(s.timestampValue),u=tt(i.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(r,e);case 5:return r.stringValue===e.stringValue;case 6:return function(s,i){return nt(s.bytesValue).isEqual(nt(i.bytesValue))}(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return function(s,i){return ue(s.geoPointValue.latitude)===ue(i.geoPointValue.latitude)&&ue(s.geoPointValue.longitude)===ue(i.geoPointValue.longitude)}(r,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return ue(s.integerValue)===ue(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=ue(s.doubleValue),u=ue(i.doubleValue);return a===u?kr(a)===kr(u):isNaN(a)&&isNaN(u)}return!1}(r,e);case 9:return An(r.arrayValue.values||[],e.arrayValue.values||[],He);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},u=i.mapValue.fields||{};if(Wu(a)!==Wu(u))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(u[c]===void 0||!He(a[c],u[c])))return!1;return!0}(r,e);default:return F()}}function Or(r,e){return(r.values||[]).find(t=>He(t,e))!==void 0}function wt(r,e){if(r===e)return 0;const t=vt(r),n=vt(e);if(t!==n)return z(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return z(r.booleanValue,e.booleanValue);case 2:return function(i,a){const u=ue(i.integerValue||i.doubleValue),c=ue(a.integerValue||a.doubleValue);return u<c?-1:u>c?1:u===c?0:isNaN(u)?isNaN(c)?0:-1:1}(r,e);case 3:return Ju(r.timestampValue,e.timestampValue);case 4:return Ju(Mr(r),Mr(e));case 5:return z(r.stringValue,e.stringValue);case 6:return function(i,a){const u=nt(i),c=nt(a);return u.compareTo(c)}(r.bytesValue,e.bytesValue);case 7:return function(i,a){const u=i.split("/"),c=a.split("/");for(let h=0;h<u.length&&h<c.length;h++){const f=z(u[h],c[h]);if(f!==0)return f}return z(u.length,c.length)}(r.referenceValue,e.referenceValue);case 8:return function(i,a){const u=z(ue(i.latitude),ue(a.latitude));return u!==0?u:z(ue(i.longitude),ue(a.longitude))}(r.geoPointValue,e.geoPointValue);case 9:return Yu(r.arrayValue,e.arrayValue);case 10:return function(i,a){var u,c,h,f;const g=i.fields||{},_=a.fields||{},b=(u=g.value)===null||u===void 0?void 0:u.arrayValue,C=(c=_.value)===null||c===void 0?void 0:c.arrayValue,N=z(((h=b==null?void 0:b.values)===null||h===void 0?void 0:h.length)||0,((f=C==null?void 0:C.values)===null||f===void 0?void 0:f.length)||0);return N!==0?N:Yu(b,C)}(r.mapValue,e.mapValue);case 11:return function(i,a){if(i===pt.mapValue&&a===pt.mapValue)return 0;if(i===pt.mapValue)return 1;if(a===pt.mapValue)return-1;const u=i.fields||{},c=Object.keys(u),h=a.fields||{},f=Object.keys(h);c.sort(),f.sort();for(let g=0;g<c.length&&g<f.length;++g){const _=z(c[g],f[g]);if(_!==0)return _;const b=wt(u[c[g]],h[f[g]]);if(b!==0)return b}return z(c.length,f.length)}(r.mapValue,e.mapValue);default:throw F()}}function Ju(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return z(r,e);const t=tt(r),n=tt(e),s=z(t.seconds,n.seconds);return s!==0?s:z(t.nanos,n.nanos)}function Yu(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=wt(t[s],n[s]);if(i)return i}return z(t.length,n.length)}function Pn(r){return fo(r)}function fo(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(t){const n=tt(t);return`time(${n.seconds},${n.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(t){return nt(t).toBase64()}(r.bytesValue):"referenceValue"in r?function(t){return O.fromName(t).toString()}(r.referenceValue):"geoPointValue"in r?function(t){return`geo(${t.latitude},${t.longitude})`}(r.geoPointValue):"arrayValue"in r?function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=fo(i);return n+"]"}(r.arrayValue):"mapValue"in r?function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of n)i?i=!1:s+=",",s+=`${a}:${fo(t.fields[a])}`;return s+"}"}(r.mapValue):F()}function Ns(r){switch(vt(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=si(r);return e?16+Ns(e):16;case 5:return 2*r.stringValue.length;case 6:return nt(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return function(n){return(n.values||[]).reduce((s,i)=>s+Ns(i),0)}(r.arrayValue);case 10:case 11:return function(n){let s=0;return Dt(n.fields,(i,a)=>{s+=i.length+Ns(a)}),s}(r.mapValue);default:throw F()}}function Jt(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function mo(r){return!!r&&"integerValue"in r}function Fr(r){return!!r&&"arrayValue"in r}function Xu(r){return!!r&&"nullValue"in r}function Zu(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function ks(r){return!!r&&"mapValue"in r}function ii(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function Rr(r){if(r.geoPointValue)return{geoPointValue:Object.assign({},r.geoPointValue)};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:Object.assign({},r.timestampValue)};if(r.mapValue){const e={mapValue:{fields:{}}};return Dt(r.mapValue.fields,(t,n)=>e.mapValue.fields[t]=Rr(n)),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Rr(r.arrayValue.values[t]);return e}return Object.assign({},r)}function Ol(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}const Fl={mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{}}}}};function Lg(r){return"nullValue"in r?xs:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?Jt(Tt.empty(),O.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?ii(r)?Fl:{mapValue:{}}:F()}function Bg(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?Jt(Tt.empty(),O.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?Fl:"mapValue"in r?ii(r)?{mapValue:{}}:pt:F()}function ec(r,e){const t=wt(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function tc(r,e){const t=wt(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Re{constructor(e){this.value=e}static empty(){return new Re({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!ks(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Rr(t)}setAll(e){let t=ae.emptyPath(),n={},s=[];e.forEach((a,u)=>{if(!t.isImmediateParentOf(u)){const c=this.getFieldsMap(t);this.applyChanges(c,n,s),n={},s=[],t=u.popLast()}a?n[u.lastSegment()]=Rr(a):s.push(u.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());ks(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return He(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];ks(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){Dt(t,(s,i)=>e[s]=i);for(const s of n)delete e[s]}clone(){return new Re(Rr(this.value))}}function Ll(r){const e=[];return Dt(r.fields,(t,n)=>{const s=new ae([t]);if(ks(n)){const i=Ll(n.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)}),new Le(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oe{constructor(e,t,n,s,i,a,u){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=a,this.documentState=u}static newInvalidDocument(e){return new oe(e,0,U.min(),U.min(),U.min(),Re.empty(),0)}static newFoundDocument(e,t,n,s){return new oe(e,1,t,U.min(),n,s,0)}static newNoDocument(e,t){return new oe(e,2,t,U.min(),U.min(),Re.empty(),0)}static newUnknownDocument(e,t){return new oe(e,3,t,U.min(),U.min(),Re.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Re.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Re.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof oe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new oe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(e,t){this.position=e,this.inclusive=t}}function nc(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],a=r.position[s];if(i.field.isKeyField()?n=O.comparator(O.fromName(a.referenceValue),t.key):n=wt(a,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function rc(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!He(r.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lr{constructor(e,t="asc"){this.field=e,this.dir=t}}function Ug(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bl{}class H extends Bl{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new qg(e,t,n):t==="array-contains"?new Gg(e,n):t==="in"?new Kl(e,n):t==="not-in"?new Kg(e,n):t==="array-contains-any"?new $g(e,n):new H(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new jg(e,n):new zg(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(wt(t,this.value)):t!==null&&vt(this.value)===vt(t)&&this.matchesComparison(wt(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return F()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ee extends Bl{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new ee(e,t)}matches(e){return Sn(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Sn(r){return r.op==="and"}function go(r){return r.op==="or"}function Lo(r){return Ul(r)&&Sn(r)}function Ul(r){for(const e of r.filters)if(e instanceof ee)return!1;return!0}function po(r){if(r instanceof H)return r.field.canonicalString()+r.op.toString()+Pn(r.value);if(Lo(r))return r.filters.map(e=>po(e)).join(",");{const e=r.filters.map(t=>po(t)).join(",");return`${r.op}(${e})`}}function ql(r,e){return r instanceof H?function(n,s){return s instanceof H&&n.op===s.op&&n.field.isEqual(s.field)&&He(n.value,s.value)}(r,e):r instanceof ee?function(n,s){return s instanceof ee&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce((i,a,u)=>i&&ql(a,s.filters[u]),!0):!1}(r,e):void F()}function jl(r,e){const t=r.filters.concat(e);return ee.create(t,r.op)}function zl(r){return r instanceof H?function(t){return`${t.field.canonicalString()} ${t.op} ${Pn(t.value)}`}(r):r instanceof ee?function(t){return t.op.toString()+" {"+t.getFilters().map(zl).join(" ,")+"}"}(r):"Filter"}class qg extends H{constructor(e,t,n){super(e,t,n),this.key=O.fromName(n.referenceValue)}matches(e){const t=O.comparator(e.key,this.key);return this.matchesComparison(t)}}class jg extends H{constructor(e,t){super(e,"in",t),this.keys=Gl("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class zg extends H{constructor(e,t){super(e,"not-in",t),this.keys=Gl("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Gl(r,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(n=>O.fromName(n.referenceValue))}class Gg extends H{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Fr(t)&&Or(t.arrayValue,this.value)}}class Kl extends H{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Or(this.value.arrayValue,t)}}class Kg extends H{constructor(e,t){super(e,"not-in",t)}matches(e){if(Or(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Or(this.value.arrayValue,t)}}class $g extends H{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Fr(t)||!t.arrayValue.values)&&t.arrayValue.values.some(n=>Or(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qg{constructor(e,t=null,n=[],s=[],i=null,a=null,u=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=a,this.endAt=u,this.ue=null}}function _o(r,e=null,t=[],n=[],s=null,i=null,a=null){return new Qg(r,e,t,n,s,i,a)}function Yt(r){const e=k(r);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(n=>po(n)).join(","),t+="|ob:",t+=e.orderBy.map(n=>function(i){return i.field.canonicalString()+i.dir}(n)).join(","),zr(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(n=>Pn(n)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(n=>Pn(n)).join(",")),e.ue=t}return e.ue}function Gr(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!Ug(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!ql(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!rc(r.startAt,e.startAt)&&rc(r.endAt,e.endAt)}function js(r){return O.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function zs(r,e){return r.filters.filter(t=>t instanceof H&&t.field.isEqual(e))}function sc(r,e,t){let n=xs,s=!0;for(const i of zs(r,e)){let a=xs,u=!0;switch(i.op){case"<":case"<=":a=Lg(i.value);break;case"==":case"in":case">=":a=i.value;break;case">":a=i.value,u=!1;break;case"!=":case"not-in":a=xs}ec({value:n,inclusive:s},{value:a,inclusive:u})<0&&(n=a,s=u)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const a=t.position[i];ec({value:n,inclusive:s},{value:a,inclusive:t.inclusive})<0&&(n=a,s=t.inclusive);break}}return{value:n,inclusive:s}}function ic(r,e,t){let n=pt,s=!0;for(const i of zs(r,e)){let a=pt,u=!0;switch(i.op){case">=":case">":a=Bg(i.value),u=!1;break;case"==":case"in":case"<=":a=i.value;break;case"<":a=i.value,u=!1;break;case"!=":case"not-in":a=pt}tc({value:n,inclusive:s},{value:a,inclusive:u})>0&&(n=a,s=u)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const a=t.position[i];tc({value:n,inclusive:s},{value:a,inclusive:t.inclusive})>0&&(n=a,s=t.inclusive);break}}return{value:n,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e,t=null,n=[],s=[],i=null,a="F",u=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=a,this.startAt=u,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function $l(r,e,t,n,s,i,a,u){return new rt(r,e,t,n,s,i,a,u)}function qn(r){return new rt(r)}function oc(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function Bo(r){return r.collectionGroup!==null}function Tn(r){const e=k(r);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new te(ae.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(h=>{h.isInequality()&&(u=u.add(h.field))})}),u})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new Lr(i,n))}),t.has(ae.keyField().canonicalString())||e.ce.push(new Lr(ae.keyField(),n))}return e.ce}function ke(r){const e=k(r);return e.le||(e.le=Wl(e,Tn(r))),e.le}function Ql(r){const e=k(r);return e.he||(e.he=Wl(e,r.explicitOrderBy)),e.he}function Wl(r,e){if(r.limitType==="F")return _o(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Lr(s.field,i)});const t=r.endAt?new At(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new At(r.startAt.position,r.startAt.inclusive):null;return _o(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function yo(r,e){const t=r.filters.concat([e]);return new rt(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function Gs(r,e,t){return new rt(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function Kr(r,e){return Gr(ke(r),ke(e))&&r.limitType===e.limitType}function Hl(r){return`${Yt(ke(r))}|lt:${r.limitType}`}function yn(r){return`Query(target=${function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map(s=>zl(s)).join(", ")}]`),zr(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map(s=>Pn(s)).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map(s=>Pn(s)).join(",")),`Target(${n})`}(ke(r))}; limitType=${r.limitType})`}function $r(r,e){return e.isFoundDocument()&&function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):O.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)}(r,e)&&function(n,s){for(const i of Tn(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(r,e)&&function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0}(r,e)&&function(n,s){return!(n.startAt&&!function(a,u,c){const h=nc(a,u,c);return a.inclusive?h<=0:h<0}(n.startAt,Tn(n),s)||n.endAt&&!function(a,u,c){const h=nc(a,u,c);return a.inclusive?h>=0:h>0}(n.endAt,Tn(n),s))}(r,e)}function Jl(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function Yl(r){return(e,t)=>{let n=!1;for(const s of Tn(r)){const i=Wg(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function Wg(r,e,t){const n=r.field.isKeyField()?O.comparator(e.key,t.key):function(i,a,u){const c=a.data.field(i),h=u.data.field(i);return c!==null&&h!==null?wt(c,h):F()}(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return F()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Dt(this.inner,(t,n)=>{for(const[s,i]of n)e(s,i)})}isEmpty(){return kl(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hg=new se(O.comparator);function Be(){return Hg}const Xl=new se(O.comparator);function Tr(...r){let e=Xl;for(const t of r)e=e.insert(t.key,t);return e}function Zl(r){let e=Xl;return r.forEach((t,n)=>e=e.insert(t,n.overlayedDocument)),e}function $e(){return Pr()}function eh(){return Pr()}function Pr(){return new st(r=>r.toString(),(r,e)=>r.isEqual(e))}const Jg=new se(O.comparator),Yg=new te(O.comparator);function G(...r){let e=Yg;for(const t of r)e=e.add(t);return e}const Xg=new te(z);function Uo(){return Xg}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qo(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:kr(e)?"-0":e}}function th(r){return{integerValue:""+r}}function nh(r,e){return Sl(e)?th(e):qo(r,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oi{constructor(){this._=void 0}}function Zg(r,e,t){return r instanceof Vn?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&ri(i)&&(i=si(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(t,e):r instanceof Xt?sh(r,e):r instanceof Zt?ih(r,e):function(s,i){const a=rh(s,i),u=ac(a)+ac(s.Pe);return mo(a)&&mo(s.Pe)?th(u):qo(s.serializer,u)}(r,e)}function ep(r,e,t){return r instanceof Xt?sh(r,e):r instanceof Zt?ih(r,e):t}function rh(r,e){return r instanceof Cn?function(n){return mo(n)||function(i){return!!i&&"doubleValue"in i}(n)}(e)?e:{integerValue:0}:null}class Vn extends oi{}class Xt extends oi{constructor(e){super(),this.elements=e}}function sh(r,e){const t=oh(e);for(const n of r.elements)t.some(s=>He(s,n))||t.push(n);return{arrayValue:{values:t}}}class Zt extends oi{constructor(e){super(),this.elements=e}}function ih(r,e){let t=oh(e);for(const n of r.elements)t=t.filter(s=>!He(s,n));return{arrayValue:{values:t}}}class Cn extends oi{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function ac(r){return ue(r.integerValue||r.doubleValue)}function oh(r){return Fr(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(e,t){this.field=e,this.transform=t}}function tp(r,e){return r.field.isEqual(e.field)&&function(n,s){return n instanceof Xt&&s instanceof Xt||n instanceof Zt&&s instanceof Zt?An(n.elements,s.elements,He):n instanceof Cn&&s instanceof Cn?He(n.Pe,s.Pe):n instanceof Vn&&s instanceof Vn}(r.transform,e.transform)}class np{constructor(e,t){this.version=e,this.transformResults=t}}class ce{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new ce}static exists(e){return new ce(void 0,e)}static updateTime(e){return new ce(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ms(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class ai{}function ah(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new zn(r.key,ce.none()):new jn(r.key,r.data,ce.none());{const t=r.data,n=Re.empty();let s=new te(ae.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?n.delete(i):n.set(i,a),s=s.add(i)}return new it(r.key,n,new Le(s.toArray()),ce.none())}}function rp(r,e,t){r instanceof jn?function(s,i,a){const u=s.value.clone(),c=cc(s.fieldTransforms,i,a.transformResults);u.setAll(c),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(r,e,t):r instanceof it?function(s,i,a){if(!Ms(s.precondition,i))return void i.convertToUnknownDocument(a.version);const u=cc(s.fieldTransforms,i,a.transformResults),c=i.data;c.setAll(uh(s)),c.setAll(u),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(r,e,t):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Sr(r,e,t,n){return r instanceof jn?function(i,a,u,c){if(!Ms(i.precondition,a))return u;const h=i.value.clone(),f=lc(i.fieldTransforms,c,a);return h.setAll(f),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null}(r,e,t,n):r instanceof it?function(i,a,u,c){if(!Ms(i.precondition,a))return u;const h=lc(i.fieldTransforms,c,a),f=a.data;return f.setAll(uh(i)),f.setAll(h),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(g=>g.field))}(r,e,t,n):function(i,a,u){return Ms(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u}(r,e,t)}function sp(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=rh(n.transform,s||null);i!=null&&(t===null&&(t=Re.empty()),t.set(n.field,i))}return t||null}function uc(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&An(n,s,(i,a)=>tp(i,a))}(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class jn extends ai{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class it extends ai{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function uh(r){const e=new Map;return r.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}}),e}function cc(r,e,t){const n=new Map;L(r.length===t.length);for(let s=0;s<t.length;s++){const i=r[s],a=i.transform,u=e.data.field(i.field);n.set(i.field,ep(a,u,t[s]))}return n}function lc(r,e,t){const n=new Map;for(const s of r){const i=s.transform,a=t.data.field(s.field);n.set(s.field,Zg(i,a,e))}return n}class zn extends ai{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class jo extends ai{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zo{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&rp(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=Sr(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=Sr(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=eh();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let u=this.applyToLocalView(a,i.mutatedFields);u=t.has(s.key)?null:u;const c=ah(a,u);c!==null&&n.set(s.key,c),a.isValidDocument()||a.convertToNoDocument(U.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),G())}isEqual(e){return this.batchId===e.batchId&&An(this.mutations,e.mutations,(t,n)=>uc(t,n))&&An(this.baseMutations,e.baseMutations,(t,n)=>uc(t,n))}}class Go{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){L(e.mutations.length===n.length);let s=function(){return Jg}();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,n[a].version);return new Go(e,t,n,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ko{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ch{constructor(e,t,n){this.alias=e,this.aggregateType=t,this.fieldPath=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ip{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var _e,J;function lh(r){switch(r){default:return F();case P.CANCELLED:case P.UNKNOWN:case P.DEADLINE_EXCEEDED:case P.RESOURCE_EXHAUSTED:case P.INTERNAL:case P.UNAVAILABLE:case P.UNAUTHENTICATED:return!1;case P.INVALID_ARGUMENT:case P.NOT_FOUND:case P.ALREADY_EXISTS:case P.PERMISSION_DENIED:case P.FAILED_PRECONDITION:case P.ABORTED:case P.OUT_OF_RANGE:case P.UNIMPLEMENTED:case P.DATA_LOSS:return!0}}function hh(r){if(r===void 0)return ge("GRPC error has no .code"),P.UNKNOWN;switch(r){case _e.OK:return P.OK;case _e.CANCELLED:return P.CANCELLED;case _e.UNKNOWN:return P.UNKNOWN;case _e.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case _e.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case _e.INTERNAL:return P.INTERNAL;case _e.UNAVAILABLE:return P.UNAVAILABLE;case _e.UNAUTHENTICATED:return P.UNAUTHENTICATED;case _e.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case _e.NOT_FOUND:return P.NOT_FOUND;case _e.ALREADY_EXISTS:return P.ALREADY_EXISTS;case _e.PERMISSION_DENIED:return P.PERMISSION_DENIED;case _e.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case _e.ABORTED:return P.ABORTED;case _e.OUT_OF_RANGE:return P.OUT_OF_RANGE;case _e.UNIMPLEMENTED:return P.UNIMPLEMENTED;case _e.DATA_LOSS:return P.DATA_LOSS;default:return F()}}(J=_e||(_e={}))[J.OK=0]="OK",J[J.CANCELLED=1]="CANCELLED",J[J.UNKNOWN=2]="UNKNOWN",J[J.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",J[J.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",J[J.NOT_FOUND=5]="NOT_FOUND",J[J.ALREADY_EXISTS=6]="ALREADY_EXISTS",J[J.PERMISSION_DENIED=7]="PERMISSION_DENIED",J[J.UNAUTHENTICATED=16]="UNAUTHENTICATED",J[J.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",J[J.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",J[J.ABORTED=10]="ABORTED",J[J.OUT_OF_RANGE=11]="OUT_OF_RANGE",J[J.UNIMPLEMENTED=12]="UNIMPLEMENTED",J[J.INTERNAL=13]="INTERNAL",J[J.UNAVAILABLE=14]="UNAVAILABLE",J[J.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ks=null;/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dh(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const op=new Qt([4294967295,4294967295],0);function hc(r){const e=dh().encode(r),t=new fl;return t.update(e),new Uint8Array(t.digest())}function dc(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Qt([t,n],0),new Qt([s,i],0)]}class $o{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new vr(`Invalid padding: ${t}`);if(n<0)throw new vr(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new vr(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new vr(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Qt.fromNumber(this.Ie)}Ee(e,t,n){let s=e.add(t.multiply(Qt.fromNumber(n)));return s.compare(op)===1&&(s=new Qt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=hc(e),[n,s]=dc(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(n,s,i);if(!this.de(a))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new $o(i,s,t);return n.forEach(u=>a.insert(u)),a}insert(e){if(this.Ie===0)return;const t=hc(e),[n,s]=dc(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(n,s,i);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class vr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wr{constructor(e,t,n,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,Hr.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new Wr(U.min(),s,new se(z),Be(),G())}}class Hr{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new Hr(n,t,G(),G(),G())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Os{constructor(e,t,n,s){this.Re=e,this.removedTargetIds=t,this.key=n,this.Ve=s}}class fh{constructor(e,t){this.targetId=e,this.me=t}}class mh{constructor(e,t,n=de.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class fc{constructor(){this.fe=0,this.ge=gc(),this.pe=de.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=G(),t=G(),n=G();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:F()}}),new Hr(this.pe,this.ye,e,t,n)}Ce(){this.we=!1,this.ge=gc()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,L(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class ap{constructor(e){this.Le=e,this.Be=new Map,this.ke=Be(),this.qe=mc(),this.Qe=new se(z)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const n=this.Ge(t);switch(e.state){case 0:this.ze(t)&&n.De(e.resumeToken);break;case 1:n.Oe(),n.Se||n.Ce(),n.De(e.resumeToken);break;case 2:n.Oe(),n.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(n.Ne(),n.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),n.De(e.resumeToken));break;default:F()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((n,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,n=e.me.count,s=this.Je(t);if(s){const i=s.target;if(js(i))if(n===0){const a=new O(i.path);this.Ue(t,a,oe.newNoDocument(a,U.min()))}else L(n===1);else{const a=this.Ye(t);if(a!==n){const u=this.Ze(e),c=u?this.Xe(u,e,a):1;if(c!==0){this.je(t);const h=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,h)}Ks==null||Ks.et(function(f,g,_,b,C){var N,V,q,j,B,$;const Z={localCacheCount:f,existenceFilterCount:g.count,databaseId:_.database,projectId:_.projectId},K=g.unchangedNames;return K&&(Z.bloomFilter={applied:C===0,hashCount:(N=K==null?void 0:K.hashCount)!==null&&N!==void 0?N:0,bitmapLength:(j=(q=(V=K==null?void 0:K.bits)===null||V===void 0?void 0:V.bitmap)===null||q===void 0?void 0:q.length)!==null&&j!==void 0?j:0,padding:($=(B=K==null?void 0:K.bits)===null||B===void 0?void 0:B.padding)!==null&&$!==void 0?$:0,mightContain:E=>{var p;return(p=b==null?void 0:b.mightContain(E))!==null&&p!==void 0&&p}}),Z}(a,e.me,this.Le.tt(),u,c))}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let a,u;try{a=nt(n).toUint8Array()}catch(c){if(c instanceof Ml)return qe("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{u=new $o(a,s,i)}catch(c){return qe(c instanceof vr?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return u.Ie===0?null:u}Xe(e,t,n){return t.me.count===n-this.nt(e,t.targetId)?0:2}nt(e,t){const n=this.Le.getRemoteKeysForTarget(t);let s=0;return n.forEach(i=>{const a=this.Le.tt(),u=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(u)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,a)=>{const u=this.Je(a);if(u){if(i.current&&js(u.target)){const c=new O(u.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,oe.newNoDocument(c,e))}i.be&&(t.set(a,i.ve()),i.Ce())}});let n=G();this.qe.forEach((i,a)=>{let u=!0;a.forEachWhile(c=>{const h=this.Je(c);return!h||h.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(n=n.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new Wr(e,t,this.Qe,this.ke,n);return this.ke=Be(),this.qe=mc(),this.Qe=new se(z),s}$e(e,t){if(!this.ze(e))return;const n=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,n),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,n){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),n&&(this.ke=this.ke.insert(t,n))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new fc,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new te(z),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||x("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new fc),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function mc(){return new se(O.comparator)}function gc(){return new se(O.comparator)}const up={asc:"ASCENDING",desc:"DESCENDING"},cp={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},lp={and:"AND",or:"OR"};class hp{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Io(r,e){return r.useProto3Json||zr(e)?e:{value:e}}function Dn(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function gh(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function dp(r,e){return Dn(r,e.toTimestamp())}function pe(r){return L(!!r),U.fromTimestamp(function(t){const n=tt(t);return new le(n.seconds,n.nanos)}(r))}function Qo(r,e){return Eo(r,e).canonicalString()}function Eo(r,e){const t=function(s){return new W(["projects",s.projectId,"databases",s.database])}(r).child("documents");return e===void 0?t:t.child(e)}function ph(r){const e=W.fromString(r);return L(Rh(e)),e}function Br(r,e){return Qo(r.databaseId,e.path)}function We(r,e){const t=ph(e);if(t.get(1)!==r.databaseId.projectId)throw new D(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new D(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new O(Ih(t))}function _h(r,e){return Qo(r.databaseId,e)}function yh(r){const e=ph(r);return e.length===4?W.emptyPath():Ih(e)}function To(r){return new W(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Ih(r){return L(r.length>4&&r.get(4)==="documents"),r.popFirst(5)}function pc(r,e,t){return{name:Br(r,e),fields:t.value.mapValue.fields}}function Eh(r,e,t){const n=We(r,e.name),s=pe(e.updateTime),i=e.createTime?pe(e.createTime):U.min(),a=new Re({mapValue:{fields:e.fields}}),u=oe.newFoundDocument(n,s,i,a);return t&&u.setHasCommittedMutations(),t?u.setHasCommittedMutations():u}function fp(r,e){return"found"in e?function(n,s){L(!!s.found),s.found.name,s.found.updateTime;const i=We(n,s.found.name),a=pe(s.found.updateTime),u=s.found.createTime?pe(s.found.createTime):U.min(),c=new Re({mapValue:{fields:s.found.fields}});return oe.newFoundDocument(i,a,u,c)}(r,e):"missing"in e?function(n,s){L(!!s.missing),L(!!s.readTime);const i=We(n,s.missing),a=pe(s.readTime);return oe.newNoDocument(i,a)}(r,e):F()}function mp(r,e){let t;if("targetChange"in e){e.targetChange;const n=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:F()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,f){return h.useProto3Json?(L(f===void 0||typeof f=="string"),de.fromBase64String(f||"")):(L(f===void 0||f instanceof Buffer||f instanceof Uint8Array),de.fromUint8Array(f||new Uint8Array))}(r,e.targetChange.resumeToken),a=e.targetChange.cause,u=a&&function(h){const f=h.code===void 0?P.UNKNOWN:hh(h.code);return new D(f,h.message||"")}(a);t=new mh(n,s,i,u||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=We(r,n.document.name),i=pe(n.document.updateTime),a=n.document.createTime?pe(n.document.createTime):U.min(),u=new Re({mapValue:{fields:n.document.fields}}),c=oe.newFoundDocument(s,i,a,u),h=n.targetIds||[],f=n.removedTargetIds||[];t=new Os(h,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=We(r,n.document),i=n.readTime?pe(n.readTime):U.min(),a=oe.newNoDocument(s,i),u=n.removedTargetIds||[];t=new Os([],u,a.key,a)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=We(r,n.document),i=n.removedTargetIds||[];t=new Os([],i,s,null)}else{if(!("filter"in e))return F();{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,a=new ip(s,i),u=n.targetId;t=new fh(u,a)}}return t}function Ur(r,e){let t;if(e instanceof jn)t={update:pc(r,e.key,e.value)};else if(e instanceof zn)t={delete:Br(r,e.key)};else if(e instanceof it)t={update:pc(r,e.key,e.data),updateMask:Ep(e.fieldMask)};else{if(!(e instanceof jo))return F();t={verify:Br(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(n=>function(i,a){const u=a.transform;if(u instanceof Vn)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof Xt)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof Zt)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof Cn)return{fieldPath:a.field.canonicalString(),increment:u.Pe};throw F()}(0,n))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:dp(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:F()}(r,e.precondition)),t}function vo(r,e){const t=e.currentDocument?function(i){return i.updateTime!==void 0?ce.updateTime(pe(i.updateTime)):i.exists!==void 0?ce.exists(i.exists):ce.none()}(e.currentDocument):ce.none(),n=e.updateTransforms?e.updateTransforms.map(s=>function(a,u){let c=null;if("setToServerValue"in u)L(u.setToServerValue==="REQUEST_TIME"),c=new Vn;else if("appendMissingElements"in u){const f=u.appendMissingElements.values||[];c=new Xt(f)}else if("removeAllFromArray"in u){const f=u.removeAllFromArray.values||[];c=new Zt(f)}else"increment"in u?c=new Cn(a,u.increment):F();const h=ae.fromServerFormat(u.fieldPath);return new Qr(h,c)}(r,s)):[];if(e.update){e.update.name;const s=We(r,e.update.name),i=new Re({mapValue:{fields:e.update.fields}});if(e.updateMask){const a=function(c){const h=c.fieldPaths||[];return new Le(h.map(f=>ae.fromServerFormat(f)))}(e.updateMask);return new it(s,i,a,t,n)}return new jn(s,i,t,n)}if(e.delete){const s=We(r,e.delete);return new zn(s,t)}if(e.verify){const s=We(r,e.verify);return new jo(s,t)}return F()}function gp(r,e){return r&&r.length>0?(L(e!==void 0),r.map(t=>function(s,i){let a=s.updateTime?pe(s.updateTime):pe(i);return a.isEqual(U.min())&&(a=pe(i)),new np(a,s.transformResults||[])}(t,e))):[]}function Th(r,e){return{documents:[_h(r,e.path)]}}function ui(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=_h(r,s);const i=function(h){if(h.length!==0)return bh(ee.create(h,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const a=function(h){if(h.length!==0)return h.map(f=>function(_){return{field:ft(_.field),direction:_p(_.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const u=Io(r,e.limit);return u!==null&&(t.structuredQuery.limit=u),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:t,parent:s}}function vh(r,e,t,n){const{_t:s,parent:i}=ui(r,e),a={},u=[];let c=0;return t.forEach(h=>{const f=n?h.alias:"aggregate_"+c++;a[f]=h.alias,h.aggregateType==="count"?u.push({alias:f,count:{}}):h.aggregateType==="avg"?u.push({alias:f,avg:{field:ft(h.fieldPath)}}):h.aggregateType==="sum"&&u.push({alias:f,sum:{field:ft(h.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:u,structuredQuery:s.structuredQuery},parent:s.parent},ut:a,parent:i}}function wh(r){let e=yh(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){L(n===1);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(g){const _=Ah(g);return _ instanceof ee&&Lo(_)?_.getFilters():[_]}(t.where));let a=[];t.orderBy&&(a=function(g){return g.map(_=>function(C){return new Lr(In(C.field),function(V){switch(V){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(_))}(t.orderBy));let u=null;t.limit&&(u=function(g){let _;return _=typeof g=="object"?g.value:g,zr(_)?null:_}(t.limit));let c=null;t.startAt&&(c=function(g){const _=!!g.before,b=g.values||[];return new At(b,_)}(t.startAt));let h=null;return t.endAt&&(h=function(g){const _=!g.before,b=g.values||[];return new At(b,_)}(t.endAt)),$l(e,s,a,i,u,"F",c,h)}function pp(r,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return F()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Ah(r){return r.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=In(t.unaryFilter.field);return H.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=In(t.unaryFilter.field);return H.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=In(t.unaryFilter.field);return H.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=In(t.unaryFilter.field);return H.create(a,"!=",{nullValue:"NULL_VALUE"});default:return F()}}(r):r.fieldFilter!==void 0?function(t){return H.create(In(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return F()}}(t.fieldFilter.op),t.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(t){return ee.create(t.compositeFilter.filters.map(n=>Ah(n)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return F()}}(t.compositeFilter.op))}(r):F()}function _p(r){return up[r]}function yp(r){return cp[r]}function Ip(r){return lp[r]}function ft(r){return{fieldPath:r.canonicalString()}}function In(r){return ae.fromServerFormat(r.fieldPath)}function bh(r){return r instanceof H?function(t){if(t.op==="=="){if(Zu(t.value))return{unaryFilter:{field:ft(t.field),op:"IS_NAN"}};if(Xu(t.value))return{unaryFilter:{field:ft(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Zu(t.value))return{unaryFilter:{field:ft(t.field),op:"IS_NOT_NAN"}};if(Xu(t.value))return{unaryFilter:{field:ft(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ft(t.field),op:yp(t.op),value:t.value}}}(r):r instanceof ee?function(t){const n=t.getFilters().map(s=>bh(s));return n.length===1?n[0]:{compositeFilter:{op:Ip(t.op),filters:n}}}(r):F()}function Ep(r){const e=[];return r.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Rh(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(e,t,n,s,i=U.min(),a=U.min(),u=de.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=c}withSequenceNumber(e){return new Ze(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Ze(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Ze(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Ze(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ph{constructor(e){this.ct=e}}function Tp(r,e){let t;if(e.document)t=Eh(r.ct,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=O.fromSegments(e.noDocument.path),s=tn(e.noDocument.readTime);t=oe.newNoDocument(n,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return F();{const n=O.fromSegments(e.unknownDocument.path),s=tn(e.unknownDocument.version);t=oe.newUnknownDocument(n,s)}}return e.readTime&&t.setReadTime(function(s){const i=new le(s[0],s[1]);return U.fromTimestamp(i)}(e.readTime)),t}function _c(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:$s(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=function(i,a){return{name:Br(i,a.key),fields:a.data.value.mapValue.fields,updateTime:Dn(i,a.version.toTimestamp()),createTime:Dn(i,a.createTime.toTimestamp())}}(r.ct,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:en(e.version)};else{if(!e.isUnknownDocument())return F();n.unknownDocument={path:t.path.toArray(),version:en(e.version)}}return n}function $s(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function en(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function tn(r){const e=new le(r.seconds,r.nanoseconds);return U.fromTimestamp(e)}function Gt(r,e){const t=(e.baseMutations||[]).map(i=>vo(r.ct,i));for(let i=0;i<e.mutations.length-1;++i){const a=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const u=e.mutations[i+1];a.updateTransforms=u.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const n=e.mutations.map(i=>vo(r.ct,i)),s=le.fromMillis(e.localWriteTimeMs);return new zo(e.batchId,s,t,n)}function wr(r){const e=tn(r.readTime),t=r.lastLimboFreeSnapshotVersion!==void 0?tn(r.lastLimboFreeSnapshotVersion):U.min();let n;return n=function(i){return i.documents!==void 0}(r.query)?function(i){return L(i.documents.length===1),ke(qn(yh(i.documents[0])))}(r.query):function(i){return ke(wh(i))}(r.query),new Ze(n,r.targetId,"TargetPurposeListen",r.lastListenSequenceNumber,e,t,de.fromBase64String(r.resumeToken))}function Sh(r,e){const t=en(e.snapshotVersion),n=en(e.lastLimboFreeSnapshotVersion);let s;s=js(e.target)?Th(r.ct,e.target):ui(r.ct,e.target)._t;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:Yt(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Wo(r){const e=wh({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Gs(e,e.limit,"L"):e}function Zi(r,e){return new Ko(e.largestBatchId,vo(r.ct,e.overlayMutation))}function yc(r,e){const t=e.path.lastSegment();return[r,Ne(e.path.popLast()),t]}function Ic(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:en(n.readTime),documentKey:Ne(n.documentKey.path),largestBatchId:n.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vp{getBundleMetadata(e,t){return Ec(e).get(t).next(n=>{if(n)return function(i){return{id:i.bundleId,createTime:tn(i.createTime),version:i.version}}(n)})}saveBundleMetadata(e,t){return Ec(e).put(function(s){return{bundleId:s.id,createTime:en(pe(s.createTime)),version:s.version}}(t))}getNamedQuery(e,t){return Tc(e).get(t).next(n=>{if(n)return function(i){return{name:i.name,query:Wo(i.bundledQuery),readTime:tn(i.readTime)}}(n)})}saveNamedQuery(e,t){return Tc(e).put(function(s){return{name:s.name,readTime:en(pe(s.readTime)),bundledQuery:s.bundledQuery}}(t))}}function Ec(r){return ye(r,"bundles")}function Tc(r){return ye(r,"namedQueries")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ci{constructor(e,t){this.serializer=e,this.userId=t}static lt(e,t){const n=t.uid||"";return new ci(e,n)}getOverlay(e,t){return gr(e).get(yc(this.userId,t)).next(n=>n?Zi(this.serializer,n):null)}getOverlays(e,t){const n=$e();return w.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(e,t,n){const s=[];return n.forEach((i,a)=>{const u=new Ko(t,a);s.push(this.ht(e,u))}),w.waitFor(s)}removeOverlaysForBatchId(e,t,n){const s=new Set;t.forEach(a=>s.add(Ne(a.getCollectionPath())));const i=[];return s.forEach(a=>{const u=IDBKeyRange.bound([this.userId,a,n],[this.userId,a,n+1],!1,!0);i.push(gr(e).j("collectionPathOverlayIndex",u))}),w.waitFor(i)}getOverlaysForCollection(e,t,n){const s=$e(),i=Ne(t),a=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return gr(e).U("collectionPathOverlayIndex",a).next(u=>{for(const c of u){const h=Zi(this.serializer,c);s.set(h.getKey(),h)}return s})}getOverlaysForCollectionGroup(e,t,n,s){const i=$e();let a;const u=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return gr(e).J({index:"collectionGroupOverlayIndex",range:u},(c,h,f)=>{const g=Zi(this.serializer,h);i.size()<s||g.largestBatchId===a?(i.set(g.getKey(),g),a=g.largestBatchId):f.done()}).next(()=>i)}ht(e,t){return gr(e).put(function(s,i,a){const[u,c,h]=yc(i,a.mutation.key);return{userId:i,collectionPath:c,documentId:h,collectionGroup:a.mutation.key.getCollectionGroup(),largestBatchId:a.largestBatchId,overlayMutation:Ur(s.ct,a.mutation)}}(this.serializer,this.userId,t))}}function gr(r){return ye(r,"documentOverlays")}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wp{Pt(e){return ye(e,"globals")}getSessionToken(e){return this.Pt(e).get("sessionToken").next(t=>{const n=t==null?void 0:t.value;return n?de.fromUint8Array(n):de.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.Pt(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt{constructor(){}It(e,t){this.Tt(e,t),t.Et()}Tt(e,t){if("nullValue"in e)this.dt(t,5);else if("booleanValue"in e)this.dt(t,10),t.At(e.booleanValue?1:0);else if("integerValue"in e)this.dt(t,15),t.At(ue(e.integerValue));else if("doubleValue"in e){const n=ue(e.doubleValue);isNaN(n)?this.dt(t,13):(this.dt(t,15),kr(n)?t.At(0):t.At(n))}else if("timestampValue"in e){let n=e.timestampValue;this.dt(t,20),typeof n=="string"&&(n=tt(n)),t.Rt(`${n.seconds||""}`),t.At(n.nanos||0)}else if("stringValue"in e)this.Vt(e.stringValue,t),this.ft(t);else if("bytesValue"in e)this.dt(t,30),t.gt(nt(e.bytesValue)),this.ft(t);else if("referenceValue"in e)this.yt(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.dt(t,45),t.At(n.latitude||0),t.At(n.longitude||0)}else"mapValue"in e?Ol(e)?this.dt(t,Number.MAX_SAFE_INTEGER):ii(e)?this.wt(e.mapValue,t):(this.St(e.mapValue,t),this.ft(t)):"arrayValue"in e?(this.bt(e.arrayValue,t),this.ft(t)):F()}Vt(e,t){this.dt(t,25),this.Dt(e,t)}Dt(e,t){t.Rt(e)}St(e,t){const n=e.fields||{};this.dt(t,55);for(const s of Object.keys(n))this.Vt(s,t),this.Tt(n[s],t)}wt(e,t){var n,s;const i=e.fields||{};this.dt(t,53);const a="value",u=((s=(n=i[a].arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.length)||0;this.dt(t,15),t.At(ue(u)),this.Vt(a,t),this.Tt(i[a],t)}bt(e,t){const n=e.values||[];this.dt(t,50);for(const s of n)this.Tt(s,t)}yt(e,t){this.dt(t,37),O.fromName(e).path.forEach(n=>{this.dt(t,60),this.Dt(n,t)})}dt(e,t){e.At(t)}ft(e){e.At(2)}}Kt.vt=new Kt;function Ap(r){if(r===0)return 8;let e=0;return!(r>>4)&&(e+=4,r<<=4),!(r>>6)&&(e+=2,r<<=2),!(r>>7)&&(e+=1),e}function vc(r){const e=64-function(n){let s=0;for(let i=0;i<8;++i){const a=Ap(255&n[i]);if(s+=a,a!==8)break}return s}(r);return Math.ceil(e/8)}class bp{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Ct(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ft(n.value),n=t.next();this.Mt()}xt(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ot(n.value),n=t.next();this.Nt()}Lt(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ft(n);else if(n<2048)this.Ft(960|n>>>6),this.Ft(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ft(480|n>>>12),this.Ft(128|63&n>>>6),this.Ft(128|63&n);else{const s=t.codePointAt(0);this.Ft(240|s>>>18),this.Ft(128|63&s>>>12),this.Ft(128|63&s>>>6),this.Ft(128|63&s)}}this.Mt()}Bt(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ot(n);else if(n<2048)this.Ot(960|n>>>6),this.Ot(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ot(480|n>>>12),this.Ot(128|63&n>>>6),this.Ot(128|63&n);else{const s=t.codePointAt(0);this.Ot(240|s>>>18),this.Ot(128|63&s>>>12),this.Ot(128|63&s>>>6),this.Ot(128|63&s)}}this.Nt()}kt(e){const t=this.qt(e),n=vc(t);this.Qt(1+n),this.buffer[this.position++]=255&n;for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=255&t[s]}Kt(e){const t=this.qt(e),n=vc(t);this.Qt(1+n),this.buffer[this.position++]=~(255&n);for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}$t(){this.Ut(255),this.Ut(255)}Wt(){this.Gt(255),this.Gt(255)}reset(){this.position=0}seed(e){this.Qt(e.length),this.buffer.set(e,this.position),this.position+=e.length}zt(){return this.buffer.slice(0,this.position)}qt(e){const t=function(i){const a=new DataView(new ArrayBuffer(8));return a.setFloat64(0,i,!1),new Uint8Array(a.buffer)}(e),n=(128&t[0])!=0;t[0]^=n?255:128;for(let s=1;s<t.length;++s)t[s]^=n?255:0;return t}Ft(e){const t=255&e;t===0?(this.Ut(0),this.Ut(255)):t===255?(this.Ut(255),this.Ut(0)):this.Ut(t)}Ot(e){const t=255&e;t===0?(this.Gt(0),this.Gt(255)):t===255?(this.Gt(255),this.Gt(0)):this.Gt(e)}Mt(){this.Ut(0),this.Ut(1)}Nt(){this.Gt(0),this.Gt(1)}Ut(e){this.Qt(1),this.buffer[this.position++]=e}Gt(e){this.Qt(1),this.buffer[this.position++]=~e}Qt(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class Rp{constructor(e){this.jt=e}gt(e){this.jt.Ct(e)}Rt(e){this.jt.Lt(e)}At(e){this.jt.kt(e)}Et(){this.jt.$t()}}class Pp{constructor(e){this.jt=e}gt(e){this.jt.xt(e)}Rt(e){this.jt.Bt(e)}At(e){this.jt.Kt(e)}Et(){this.jt.Wt()}}class pr{constructor(){this.jt=new bp,this.Ht=new Rp(this.jt),this.Jt=new Pp(this.jt)}seed(e){this.jt.seed(e)}Yt(e){return e===0?this.Ht:this.Jt}zt(){return this.jt.zt()}reset(){this.jt.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t{constructor(e,t,n,s){this.indexId=e,this.documentKey=t,this.arrayValue=n,this.directionalValue=s}Zt(){const e=this.directionalValue.length,t=e===0||this.directionalValue[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.directionalValue,0),t!==e?n.set([0],this.directionalValue.length):++n[n.length-1],new $t(this.indexId,this.documentKey,this.arrayValue,n)}}function ht(r,e){let t=r.indexId-e.indexId;return t!==0?t:(t=wc(r.arrayValue,e.arrayValue),t!==0?t:(t=wc(r.directionalValue,e.directionalValue),t!==0?t:O.comparator(r.documentKey,e.documentKey)))}function wc(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(e){this.Xt=new te((t,n)=>ae.comparator(t.field,n.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.en=e.orderBy,this.tn=[];for(const t of e.filters){const n=t;n.isInequality()?this.Xt=this.Xt.add(n):this.tn.push(n)}}get nn(){return this.Xt.size>1}rn(e){if(L(e.collectionGroup===this.collectionId),this.nn)return!1;const t=lo(e);if(t!==void 0&&!this.sn(t))return!1;const n=jt(e);let s=new Set,i=0,a=0;for(;i<n.length&&this.sn(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.Xt.size>0){const u=this.Xt.getIterator().getNext();if(!s.has(u.field.canonicalString())){const c=n[i];if(!this.on(u,c)||!this._n(this.en[a++],c))return!1}++i}for(;i<n.length;++i){const u=n[i];if(a>=this.en.length||!this._n(this.en[a++],u))return!1}return!0}an(){if(this.nn)return null;let e=new te(ae.comparator);const t=[];for(const n of this.tn)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new Wt(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new Wt(n.field,0))}for(const n of this.en)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new Wt(n.field,n.dir==="asc"?0:1)));return new bn(bn.UNKNOWN_ID,this.collectionId,t,Rn.empty())}sn(e){for(const t of this.tn)if(this.on(t,e))return!0;return!1}on(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}_n(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vh(r){var e,t;if(L(r instanceof H||r instanceof ee),r instanceof H){if(r instanceof Kl){const s=((t=(e=r.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(i=>H.create(r.field,"==",i)))||[];return ee.create(s,"or")}return r}const n=r.filters.map(s=>Vh(s));return ee.create(n,r.op)}function Sp(r){if(r.getFilters().length===0)return[];const e=bo(Vh(r));return L(Ch(e)),wo(e)||Ao(e)?[e]:e.getFilters()}function wo(r){return r instanceof H}function Ao(r){return r instanceof ee&&Lo(r)}function Ch(r){return wo(r)||Ao(r)||function(t){if(t instanceof ee&&go(t)){for(const n of t.getFilters())if(!wo(n)&&!Ao(n))return!1;return!0}return!1}(r)}function bo(r){if(L(r instanceof H||r instanceof ee),r instanceof H)return r;if(r.filters.length===1)return bo(r.filters[0]);const e=r.filters.map(n=>bo(n));let t=ee.create(e,r.op);return t=Qs(t),Ch(t)?t:(L(t instanceof ee),L(Sn(t)),L(t.filters.length>1),t.filters.reduce((n,s)=>Ho(n,s)))}function Ho(r,e){let t;return L(r instanceof H||r instanceof ee),L(e instanceof H||e instanceof ee),t=r instanceof H?e instanceof H?function(s,i){return ee.create([s,i],"and")}(r,e):bc(r,e):e instanceof H?bc(e,r):function(s,i){if(L(s.filters.length>0&&i.filters.length>0),Sn(s)&&Sn(i))return jl(s,i.getFilters());const a=go(s)?s:i,u=go(s)?i:s,c=a.filters.map(h=>Ho(h,u));return ee.create(c,"or")}(r,e),Qs(t)}function bc(r,e){if(Sn(e))return jl(e,r.getFilters());{const t=e.filters.map(n=>Ho(r,n));return ee.create(t,"or")}}function Qs(r){if(L(r instanceof H||r instanceof ee),r instanceof H)return r;const e=r.getFilters();if(e.length===1)return Qs(e[0]);if(Ul(r))return r;const t=e.map(s=>Qs(s)),n=[];return t.forEach(s=>{s instanceof H?n.push(s):s instanceof ee&&(s.op===r.op?n.push(...s.filters):n.push(s))}),n.length===1?n[0]:ee.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vp{constructor(){this.un=new Jo}addToCollectionParentIndex(e,t){return this.un.add(t),w.resolve()}getCollectionParents(e,t){return w.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return w.resolve()}deleteFieldIndex(e,t){return w.resolve()}deleteAllFieldIndexes(e){return w.resolve()}createTargetIndexes(e,t){return w.resolve()}getDocumentsMatchingTarget(e,t){return w.resolve(null)}getIndexType(e,t){return w.resolve(0)}getFieldIndexes(e,t){return w.resolve([])}getNextCollectionGroupToUpdate(e){return w.resolve(null)}getMinOffset(e,t){return w.resolve(je.min())}getMinOffsetFromCollectionGroup(e,t){return w.resolve(je.min())}updateCollectionGroup(e,t,n){return w.resolve()}updateIndexEntries(e,t){return w.resolve()}}class Jo{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new te(W.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new te(W.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bs=new Uint8Array(0);class Cp{constructor(e,t){this.databaseId=t,this.cn=new Jo,this.ln=new st(n=>Yt(n),(n,s)=>Gr(n,s)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.cn.has(t)){const n=t.lastSegment(),s=t.popLast();e.addOnCommittedListener(()=>{this.cn.add(t)});const i={collectionId:n,parent:Ne(s)};return Rc(e).put(i)}return w.resolve()}getCollectionParents(e,t){const n=[],s=IDBKeyRange.bound([t,""],[vl(t),""],!1,!0);return Rc(e).U(s).next(i=>{for(const a of i){if(a.collectionId!==t)break;n.push(Ke(a.parent))}return n})}addFieldIndex(e,t){const n=_r(e),s=function(u){return{indexId:u.indexId,collectionGroup:u.collectionGroup,fields:u.fields.map(c=>[c.fieldPath.canonicalString(),c.kind])}}(t);delete s.indexId;const i=n.add(s);if(t.indexState){const a=gn(e);return i.next(u=>{a.put(Ic(u,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return i.next()}deleteFieldIndex(e,t){const n=_r(e),s=gn(e),i=mn(e);return n.delete(t.indexId).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=_r(e),n=mn(e),s=gn(e);return t.j().next(()=>n.j()).next(()=>s.j())}createTargetIndexes(e,t){return w.forEach(this.hn(t),n=>this.getIndexType(e,n).next(s=>{if(s===0||s===1){const i=new Ac(n).an();if(i!=null)return this.addFieldIndex(e,i)}}))}getDocumentsMatchingTarget(e,t){const n=mn(e);let s=!0;const i=new Map;return w.forEach(this.hn(t),a=>this.Pn(e,a).next(u=>{s&&(s=!!u),i.set(a,u)})).next(()=>{if(s){let a=G();const u=[];return w.forEach(i,(c,h)=>{x("IndexedDbIndexManager",`Using index ${function(B){return`id=${B.indexId}|cg=${B.collectionGroup}|f=${B.fields.map($=>`${$.fieldPath}:${$.kind}`).join(",")}`}(c)} to execute ${Yt(t)}`);const f=function(B,$){const Z=lo($);if(Z===void 0)return null;for(const K of zs(B,Z.fieldPath))switch(K.op){case"array-contains-any":return K.value.arrayValue.values||[];case"array-contains":return[K.value]}return null}(h,c),g=function(B,$){const Z=new Map;for(const K of jt($))for(const E of zs(B,K.fieldPath))switch(E.op){case"==":case"in":Z.set(K.fieldPath.canonicalString(),E.value);break;case"not-in":case"!=":return Z.set(K.fieldPath.canonicalString(),E.value),Array.from(Z.values())}return null}(h,c),_=function(B,$){const Z=[];let K=!0;for(const E of jt($)){const p=E.kind===0?sc(B,E.fieldPath,B.startAt):ic(B,E.fieldPath,B.startAt);Z.push(p.value),K&&(K=p.inclusive)}return new At(Z,K)}(h,c),b=function(B,$){const Z=[];let K=!0;for(const E of jt($)){const p=E.kind===0?ic(B,E.fieldPath,B.endAt):sc(B,E.fieldPath,B.endAt);Z.push(p.value),K&&(K=p.inclusive)}return new At(Z,K)}(h,c),C=this.In(c,h,_),N=this.In(c,h,b),V=this.Tn(c,h,g),q=this.En(c.indexId,f,C,_.inclusive,N,b.inclusive,V);return w.forEach(q,j=>n.G(j,t.limit).next(B=>{B.forEach($=>{const Z=O.fromSegments($.documentKey);a.has(Z)||(a=a.add(Z),u.push(Z))})}))}).next(()=>u)}return w.resolve(null)})}hn(e){let t=this.ln.get(e);return t||(e.filters.length===0?t=[e]:t=Sp(ee.create(e.filters,"and")).map(n=>_o(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt)),this.ln.set(e,t),t)}En(e,t,n,s,i,a,u){const c=(t!=null?t.length:1)*Math.max(n.length,i.length),h=c/(t!=null?t.length:1),f=[];for(let g=0;g<c;++g){const _=t?this.dn(t[g/h]):bs,b=this.An(e,_,n[g%h],s),C=this.Rn(e,_,i[g%h],a),N=u.map(V=>this.An(e,_,V,!0));f.push(...this.createRange(b,C,N))}return f}An(e,t,n,s){const i=new $t(e,O.empty(),t,n);return s?i:i.Zt()}Rn(e,t,n,s){const i=new $t(e,O.empty(),t,n);return s?i.Zt():i}Pn(e,t){const n=new Ac(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next(i=>{let a=null;for(const u of i)n.rn(u)&&(!a||u.fields.length>a.fields.length)&&(a=u);return a})}getIndexType(e,t){let n=2;const s=this.hn(t);return w.forEach(s,i=>this.Pn(e,i).next(a=>{a?n!==0&&a.fields.length<function(c){let h=new te(ae.comparator),f=!1;for(const g of c.filters)for(const _ of g.getFlattenedFilters())_.field.isKeyField()||(_.op==="array-contains"||_.op==="array-contains-any"?f=!0:h=h.add(_.field));for(const g of c.orderBy)g.field.isKeyField()||(h=h.add(g.field));return h.size+(f?1:0)}(i)&&(n=1):n=0})).next(()=>function(a){return a.limit!==null}(t)&&s.length>1&&n===2?1:n)}Vn(e,t){const n=new pr;for(const s of jt(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const a=n.Yt(s.kind);Kt.vt.It(i,a)}return n.zt()}dn(e){const t=new pr;return Kt.vt.It(e,t.Yt(0)),t.zt()}mn(e,t){const n=new pr;return Kt.vt.It(Jt(this.databaseId,t),n.Yt(function(i){const a=jt(i);return a.length===0?0:a[a.length-1].kind}(e))),n.zt()}Tn(e,t,n){if(n===null)return[];let s=[];s.push(new pr);let i=0;for(const a of jt(e)){const u=n[i++];for(const c of s)if(this.fn(t,a.fieldPath)&&Fr(u))s=this.gn(s,a,u);else{const h=c.Yt(a.kind);Kt.vt.It(u,h)}}return this.pn(s)}In(e,t,n){return this.Tn(e,t,n.position)}pn(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].zt();return t}gn(e,t,n){const s=[...e],i=[];for(const a of n.arrayValue.values||[])for(const u of s){const c=new pr;c.seed(u.zt()),Kt.vt.It(a,c.Yt(t.kind)),i.push(c)}return i}fn(e,t){return!!e.filters.find(n=>n instanceof H&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in"))}getFieldIndexes(e,t){const n=_r(e),s=gn(e);return(t?n.U("collectionGroupIndex",IDBKeyRange.bound(t,t)):n.U()).next(i=>{const a=[];return w.forEach(i,u=>s.get([u.indexId,this.uid]).next(c=>{a.push(function(f,g){const _=g?new Rn(g.sequenceNumber,new je(tn(g.readTime),new O(Ke(g.documentKey)),g.largestBatchId)):Rn.empty(),b=f.fields.map(([C,N])=>new Wt(ae.fromServerFormat(C),N));return new bn(f.indexId,f.collectionGroup,b,_)}(u,c))})).next(()=>a)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:z(n.collectionGroup,s.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,n){const s=_r(e),i=gn(e);return this.yn(e).next(a=>s.U("collectionGroupIndex",IDBKeyRange.bound(t,t)).next(u=>w.forEach(u,c=>i.put(Ic(c.indexId,this.uid,a,n)))))}updateIndexEntries(e,t){const n=new Map;return w.forEach(t,(s,i)=>{const a=n.get(s.collectionGroup);return(a?w.resolve(a):this.getFieldIndexes(e,s.collectionGroup)).next(u=>(n.set(s.collectionGroup,u),w.forEach(u,c=>this.wn(e,s,c).next(h=>{const f=this.Sn(i,c);return h.isEqual(f)?w.resolve():this.bn(e,i,c,h,f)}))))})}Dn(e,t,n,s){return mn(e).put({indexId:s.indexId,uid:this.uid,arrayValue:s.arrayValue,directionalValue:s.directionalValue,orderedDocumentKey:this.mn(n,t.key),documentKey:t.key.path.toArray()})}vn(e,t,n,s){return mn(e).delete([s.indexId,this.uid,s.arrayValue,s.directionalValue,this.mn(n,t.key),t.key.path.toArray()])}wn(e,t,n){const s=mn(e);let i=new te(ht);return s.J({index:"documentKeyIndex",range:IDBKeyRange.only([n.indexId,this.uid,this.mn(n,t)])},(a,u)=>{i=i.add(new $t(n.indexId,t,u.arrayValue,u.directionalValue))}).next(()=>i)}Sn(e,t){let n=new te(ht);const s=this.Vn(t,e);if(s==null)return n;const i=lo(t);if(i!=null){const a=e.data.field(i.fieldPath);if(Fr(a))for(const u of a.arrayValue.values||[])n=n.add(new $t(t.indexId,e.key,this.dn(u),s))}else n=n.add(new $t(t.indexId,e.key,bs,s));return n}bn(e,t,n,s,i){x("IndexedDbIndexManager","Updating index entries for document '%s'",t.key);const a=[];return function(c,h,f,g,_){const b=c.getIterator(),C=h.getIterator();let N=fn(b),V=fn(C);for(;N||V;){let q=!1,j=!1;if(N&&V){const B=f(N,V);B<0?j=!0:B>0&&(q=!0)}else N!=null?j=!0:q=!0;q?(g(V),V=fn(C)):j?(_(N),N=fn(b)):(N=fn(b),V=fn(C))}}(s,i,ht,u=>{a.push(this.Dn(e,t,n,u))},u=>{a.push(this.vn(e,t,n,u))}),w.waitFor(a)}yn(e){let t=1;return gn(e).J({index:"sequenceNumberIndex",reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(n,s,i)=>{i.done(),t=s.sequenceNumber+1}).next(()=>t)}createRange(e,t,n){n=n.sort((a,u)=>ht(a,u)).filter((a,u,c)=>!u||ht(a,c[u-1])!==0);const s=[];s.push(e);for(const a of n){const u=ht(a,e),c=ht(a,t);if(u===0)s[0]=e.Zt();else if(u>0&&c<0)s.push(a),s.push(a.Zt());else if(c>0)break}s.push(t);const i=[];for(let a=0;a<s.length;a+=2){if(this.Cn(s[a],s[a+1]))return[];const u=[s[a].indexId,this.uid,s[a].arrayValue,s[a].directionalValue,bs,[]],c=[s[a+1].indexId,this.uid,s[a+1].arrayValue,s[a+1].directionalValue,bs,[]];i.push(IDBKeyRange.bound(u,c))}return i}Cn(e,t){return ht(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(Pc)}getMinOffset(e,t){return w.mapArray(this.hn(t),n=>this.Pn(e,n).next(s=>s||F())).next(Pc)}}function Rc(r){return ye(r,"collectionParents")}function mn(r){return ye(r,"indexEntries")}function _r(r){return ye(r,"indexConfiguration")}function gn(r){return ye(r,"indexState")}function Pc(r){L(r.length!==0);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;Mo(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new je(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sc={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class xe{constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}static withCacheSize(e){return new xe(e,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dh(r,e,t){const n=r.store("mutations"),s=r.store("documentMutations"),i=[],a=IDBKeyRange.only(t.batchId);let u=0;const c=n.J({range:a},(f,g,_)=>(u++,_.delete()));i.push(c.next(()=>{L(u===1)}));const h=[];for(const f of t.mutations){const g=Vl(e,f.key.path,t.batchId);i.push(s.delete(g)),h.push(f.key)}return w.waitFor(i).next(()=>h)}function Ws(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw F();e=r.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */xe.DEFAULT_COLLECTION_PERCENTILE=10,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,xe.DEFAULT=new xe(41943040,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),xe.DISABLED=new xe(-1,0,0);class li{constructor(e,t,n,s){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=s,this.Fn={}}static lt(e,t,n,s){L(e.uid!=="");const i=e.isAuthenticated()?e.uid:"";return new li(i,t,n,s)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return dt(e).J({index:"userMutationsIndex",range:n},(s,i,a)=>{t=!1,a.done()}).next(()=>t)}addMutationBatch(e,t,n,s){const i=En(e),a=dt(e);return a.add({}).next(u=>{L(typeof u=="number");const c=new zo(u,t,n,s),h=function(b,C,N){const V=N.baseMutations.map(j=>Ur(b.ct,j)),q=N.mutations.map(j=>Ur(b.ct,j));return{userId:C,batchId:N.batchId,localWriteTimeMs:N.localWriteTime.toMillis(),baseMutations:V,mutations:q}}(this.serializer,this.userId,c),f=[];let g=new te((_,b)=>z(_.canonicalString(),b.canonicalString()));for(const _ of s){const b=Vl(this.userId,_.key.path,u);g=g.add(_.key.path.popLast()),f.push(a.put(h)),f.push(i.put(b,_g))}return g.forEach(_=>{f.push(this.indexManager.addToCollectionParentIndex(e,_))}),e.addOnCommittedListener(()=>{this.Fn[u]=c.keys()}),w.waitFor(f).next(()=>c)})}lookupMutationBatch(e,t){return dt(e).get(t).next(n=>n?(L(n.userId===this.userId),Gt(this.serializer,n)):null)}Mn(e,t){return this.Fn[t]?w.resolve(this.Fn[t]):this.lookupMutationBatch(e,t).next(n=>{if(n){const s=n.keys();return this.Fn[t]=s,s}return null})}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return dt(e).J({index:"userMutationsIndex",range:s},(a,u,c)=>{u.userId===this.userId&&(L(u.batchId>=n),i=Gt(this.serializer,u)),c.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=-1;return dt(e).J({index:"userMutationsIndex",range:t,reverse:!0},(s,i,a)=>{n=i.batchId,a.done()}).next(()=>n)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,-1],[this.userId,Number.POSITIVE_INFINITY]);return dt(e).U("userMutationsIndex",t).next(n=>n.map(s=>Gt(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=Ds(this.userId,t.path),s=IDBKeyRange.lowerBound(n),i=[];return En(e).J({range:s},(a,u,c)=>{const[h,f,g]=a,_=Ke(f);if(h===this.userId&&t.path.isEqual(_))return dt(e).get(g).next(b=>{if(!b)throw F();L(b.userId===this.userId),i.push(Gt(this.serializer,b))});c.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new te(z);const s=[];return t.forEach(i=>{const a=Ds(this.userId,i.path),u=IDBKeyRange.lowerBound(a),c=En(e).J({range:u},(h,f,g)=>{const[_,b,C]=h,N=Ke(b);_===this.userId&&i.path.isEqual(N)?n=n.add(C):g.done()});s.push(c)}),w.waitFor(s).next(()=>this.xn(e,n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1,i=Ds(this.userId,n),a=IDBKeyRange.lowerBound(i);let u=new te(z);return En(e).J({range:a},(c,h,f)=>{const[g,_,b]=c,C=Ke(_);g===this.userId&&n.isPrefixOf(C)?C.length===s&&(u=u.add(b)):f.done()}).next(()=>this.xn(e,u))}xn(e,t){const n=[],s=[];return t.forEach(i=>{s.push(dt(e).get(i).next(a=>{if(a===null)throw F();L(a.userId===this.userId),n.push(Gt(this.serializer,a))}))}),w.waitFor(s).next(()=>n)}removeMutationBatch(e,t){return Dh(e._e,this.userId,t).next(n=>(e.addOnCommittedListener(()=>{this.On(t.batchId)}),w.forEach(n,s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))}On(e){delete this.Fn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return w.resolve();const n=IDBKeyRange.lowerBound(function(a){return[a]}(this.userId)),s=[];return En(e).J({range:n},(i,a,u)=>{if(i[0]===this.userId){const c=Ke(i[1]);s.push(c)}else u.done()}).next(()=>{L(s.length===0)})})}containsKey(e,t){return xh(e,this.userId,t)}Nn(e){return Nh(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:-1,lastStreamToken:""})}}function xh(r,e,t){const n=Ds(e,t.path),s=n[1],i=IDBKeyRange.lowerBound(n);let a=!1;return En(r).J({range:i,H:!0},(u,c,h)=>{const[f,g,_]=u;f===e&&g===s&&(a=!0),h.done()}).next(()=>a)}function dt(r){return ye(r,"mutations")}function En(r){return ye(r,"documentMutations")}function Nh(r){return ye(r,"mutationQueues")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nn{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new nn(0)}static kn(){return new nn(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dp{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.qn(e).next(t=>{const n=new nn(t.highestTargetId);return t.highestTargetId=n.next(),this.Qn(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.qn(e).next(t=>U.fromTimestamp(new le(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.qn(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,n){return this.qn(e).next(s=>(s.highestListenSequenceNumber=t,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.Qn(e,s)))}addTargetData(e,t){return this.Kn(e,t).next(()=>this.qn(e).next(n=>(n.targetCount+=1,this.$n(t,n),this.Qn(e,n))))}updateTargetData(e,t){return this.Kn(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>pn(e).delete(t.targetId)).next(()=>this.qn(e)).next(n=>(L(n.targetCount>0),n.targetCount-=1,this.Qn(e,n)))}removeTargets(e,t,n){let s=0;const i=[];return pn(e).J((a,u)=>{const c=wr(u);c.sequenceNumber<=t&&n.get(c.targetId)===null&&(s++,i.push(this.removeTargetData(e,c)))}).next(()=>w.waitFor(i)).next(()=>s)}forEachTarget(e,t){return pn(e).J((n,s)=>{const i=wr(s);t(i)})}qn(e){return Vc(e).get("targetGlobalKey").next(t=>(L(t!==null),t))}Qn(e,t){return Vc(e).put("targetGlobalKey",t)}Kn(e,t){return pn(e).put(Sh(this.serializer,t))}$n(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.qn(e).next(t=>t.targetCount)}getTargetData(e,t){const n=Yt(t),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return pn(e).J({range:s,index:"queryTargetsIndex"},(a,u,c)=>{const h=wr(u);Gr(t,h.target)&&(i=h,c.done())}).next(()=>i)}addMatchingKeys(e,t,n){const s=[],i=mt(e);return t.forEach(a=>{const u=Ne(a.path);s.push(i.put({targetId:n,path:u})),s.push(this.referenceDelegate.addReference(e,n,a))}),w.waitFor(s)}removeMatchingKeys(e,t,n){const s=mt(e);return w.forEach(t,i=>{const a=Ne(i.path);return w.waitFor([s.delete([n,a]),this.referenceDelegate.removeReference(e,n,i)])})}removeMatchingKeysForTargetId(e,t){const n=mt(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),s=mt(e);let i=G();return s.J({range:n,H:!0},(a,u,c)=>{const h=Ke(a[1]),f=new O(h);i=i.add(f)}).next(()=>i)}containsKey(e,t){const n=Ne(t.path),s=IDBKeyRange.bound([n],[vl(n)],!1,!0);let i=0;return mt(e).J({index:"documentTargetsIndex",H:!0,range:s},([a,u],c,h)=>{a!==0&&(i++,h.done())}).next(()=>i>0)}ot(e,t){return pn(e).get(t).next(n=>n?wr(n):null)}}function pn(r){return ye(r,"targets")}function Vc(r){return ye(r,"targetGlobal")}function mt(r){return ye(r,"targetDocuments")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cc([r,e],[t,n]){const s=z(r,t);return s===0?z(e,n):s}class xp{constructor(e){this.Un=e,this.buffer=new te(Cc),this.Wn=0}Gn(){return++this.Wn}zn(e){const t=[e,this.Gn()];if(this.buffer.size<this.Un)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();Cc(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class kh{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.jn=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Hn(6e4)}stop(){this.jn&&(this.jn.cancel(),this.jn=null)}get started(){return this.jn!==null}Hn(e){x("LruGarbageCollector",`Garbage collection scheduled in ${e}ms`),this.jn=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.jn=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Ct(t)?x("LruGarbageCollector","Ignoring IndexedDB error during garbage collection: ",t):await Vt(t)}await this.Hn(3e5)})}}class Np{constructor(e,t){this.Jn=e,this.params=t}calculateTargetCount(e,t){return this.Jn.Yn(e).next(n=>Math.floor(t/100*n))}nthSequenceNumber(e,t){if(t===0)return w.resolve(Fe.oe);const n=new xp(t);return this.Jn.forEachTarget(e,s=>n.zn(s.sequenceNumber)).next(()=>this.Jn.Zn(e,s=>n.zn(s))).next(()=>n.maxValue)}removeTargets(e,t,n){return this.Jn.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.Jn.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(x("LruGarbageCollector","Garbage collection skipped; disabled"),w.resolve(Sc)):this.getCacheSize(e).next(n=>n<this.params.cacheSizeCollectionThreshold?(x("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Sc):this.Xn(e,t))}getCacheSize(e){return this.Jn.getCacheSize(e)}Xn(e,t){let n,s,i,a,u,c,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(g=>(g>this.params.maximumSequenceNumbersToCollect?(x("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${g}`),s=this.params.maximumSequenceNumbersToCollect):s=g,a=Date.now(),this.nthSequenceNumber(e,s))).next(g=>(n=g,u=Date.now(),this.removeTargets(e,n,t))).next(g=>(i=g,c=Date.now(),this.removeOrphanedDocuments(e,n))).next(g=>(h=Date.now(),_n()<=Y.DEBUG&&x("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-f}ms
	Determined least recently used ${s} in `+(u-a)+`ms
	Removed ${i} targets in `+(c-u)+`ms
	Removed ${g} documents in `+(h-c)+`ms
Total Duration: ${h-f}ms`),w.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:g})))}}function Mh(r,e){return new Np(r,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kp{constructor(e,t){this.db=e,this.garbageCollector=Mh(this,t)}Yn(e){const t=this.er(e);return this.db.getTargetCache().getTargetCount(e).next(n=>t.next(s=>n+s))}er(e){let t=0;return this.Zn(e,n=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Zn(e,t){return this.tr(e,(n,s)=>t(s))}addReference(e,t,n){return Rs(e,n)}removeReference(e,t,n){return Rs(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return Rs(e,t)}nr(e,t){return function(s,i){let a=!1;return Nh(s).Y(u=>xh(s,u,i).next(c=>(c&&(a=!0),w.resolve(!c)))).next(()=>a)}(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.tr(e,(a,u)=>{if(u<=t){const c=this.nr(e,a).next(h=>{if(!h)return i++,n.getEntry(e,a).next(()=>(n.removeEntry(a,U.min()),mt(e).delete(function(g){return[0,Ne(g.path)]}(a))))});s.push(c)}}).next(()=>w.waitFor(s)).next(()=>n.apply(e)).next(()=>i)}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return Rs(e,t)}tr(e,t){const n=mt(e);let s,i=Fe.oe;return n.J({index:"documentTargetsIndex"},([a,u],{path:c,sequenceNumber:h})=>{a===0?(i!==Fe.oe&&t(new O(Ke(s)),i),i=h,s=c):i=Fe.oe}).next(()=>{i!==Fe.oe&&t(new O(Ke(s)),i)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Rs(r,e){return mt(r).put(function(n,s){return{targetId:0,path:Ne(n.path),sequenceNumber:s}}(e,r.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oh{constructor(){this.changes=new st(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,oe.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?w.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mp{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return Ut(e).put(n)}removeEntry(e,t,n){return Ut(e).delete(function(i,a){const u=i.path.toArray();return[u.slice(0,u.length-2),u[u.length-2],$s(a),u[u.length-1]]}(t,n))}updateMetadata(e,t){return this.getMetadata(e).next(n=>(n.byteSize+=t,this.rr(e,n)))}getEntry(e,t){let n=oe.newInvalidDocument(t);return Ut(e).J({index:"documentKeyIndex",range:IDBKeyRange.only(yr(t))},(s,i)=>{n=this.ir(t,i)}).next(()=>n)}sr(e,t){let n={size:0,document:oe.newInvalidDocument(t)};return Ut(e).J({index:"documentKeyIndex",range:IDBKeyRange.only(yr(t))},(s,i)=>{n={document:this.ir(t,i),size:Ws(i)}}).next(()=>n)}getEntries(e,t){let n=Be();return this._r(e,t,(s,i)=>{const a=this.ir(s,i);n=n.insert(s,a)}).next(()=>n)}ar(e,t){let n=Be(),s=new se(O.comparator);return this._r(e,t,(i,a)=>{const u=this.ir(i,a);n=n.insert(i,u),s=s.insert(i,Ws(a))}).next(()=>({documents:n,ur:s}))}_r(e,t,n){if(t.isEmpty())return w.resolve();let s=new te(Nc);t.forEach(c=>s=s.add(c));const i=IDBKeyRange.bound(yr(s.first()),yr(s.last())),a=s.getIterator();let u=a.getNext();return Ut(e).J({index:"documentKeyIndex",range:i},(c,h,f)=>{const g=O.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;u&&Nc(u,g)<0;)n(u,null),u=a.getNext();u&&u.isEqual(g)&&(n(u,h),u=a.hasNext()?a.getNext():null),u?f.$(yr(u)):f.done()}).next(()=>{for(;u;)n(u,null),u=a.hasNext()?a.getNext():null})}getDocumentsMatchingQuery(e,t,n,s,i){const a=t.path,u=[a.popLast().toArray(),a.lastSegment(),$s(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],c=[a.popLast().toArray(),a.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Ut(e).U(IDBKeyRange.bound(u,c,!0)).next(h=>{i==null||i.incrementDocumentReadCount(h.length);let f=Be();for(const g of h){const _=this.ir(O.fromSegments(g.prefixPath.concat(g.collectionGroup,g.documentId)),g);_.isFoundDocument()&&($r(t,_)||s.has(_.key))&&(f=f.insert(_.key,_))}return f})}getAllFromCollectionGroup(e,t,n,s){let i=Be();const a=xc(t,n),u=xc(t,je.max());return Ut(e).J({index:"collectionGroupIndex",range:IDBKeyRange.bound(a,u,!0)},(c,h,f)=>{const g=this.ir(O.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);i=i.insert(g.key,g),i.size===s&&f.done()}).next(()=>i)}newChangeBuffer(e){return new Op(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return Dc(e).get("remoteDocumentGlobalKey").next(t=>(L(!!t),t))}rr(e,t){return Dc(e).put("remoteDocumentGlobalKey",t)}ir(e,t){if(t){const n=Tp(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(U.min())))return n}return oe.newInvalidDocument(e)}}function Fh(r){return new Mp(r)}class Op extends Oh{constructor(e,t){super(),this.cr=e,this.trackRemovals=t,this.lr=new st(n=>n.toString(),(n,s)=>n.isEqual(s))}applyChanges(e){const t=[];let n=0,s=new te((i,a)=>z(i.canonicalString(),a.canonicalString()));return this.changes.forEach((i,a)=>{const u=this.lr.get(i);if(t.push(this.cr.removeEntry(e,i,u.readTime)),a.isValidDocument()){const c=_c(this.cr.serializer,a);s=s.add(i.path.popLast());const h=Ws(c);n+=h-u.size,t.push(this.cr.addEntry(e,i,c))}else if(n-=u.size,this.trackRemovals){const c=_c(this.cr.serializer,a.convertToNoDocument(U.min()));t.push(this.cr.addEntry(e,i,c))}}),s.forEach(i=>{t.push(this.cr.indexManager.addToCollectionParentIndex(e,i))}),t.push(this.cr.updateMetadata(e,n)),w.waitFor(t)}getFromCache(e,t){return this.cr.sr(e,t).next(n=>(this.lr.set(t,{size:n.size,readTime:n.document.readTime}),n.document))}getAllFromCache(e,t){return this.cr.ar(e,t).next(({documents:n,ur:s})=>(s.forEach((i,a)=>{this.lr.set(i,{size:a,readTime:n.get(i).readTime})}),n))}}function Dc(r){return ye(r,"remoteDocumentGlobal")}function Ut(r){return ye(r,"remoteDocumentsV14")}function yr(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function xc(r,e){const t=e.documentKey.path.toArray();return[r,$s(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Nc(r,e){const t=r.path.toArray(),n=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<n.length-2;++i)if(s=z(t[i],n[i]),s)return s;return s=z(t.length,n.length),s||(s=z(t[t.length-2],n[n.length-2]),s||z(t[t.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lh{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(n=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(n!==null&&Sr(n.mutation,s,Le.empty(),le.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.getLocalViewOfDocuments(e,n,G()).next(()=>n))}getLocalViewOfDocuments(e,t,n=G()){const s=$e();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,n).next(i=>{let a=Tr();return i.forEach((u,c)=>{a=a.insert(u,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const n=$e();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,G()))}populateOverlays(e,t,n){const s=[];return n.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,u)=>{t.set(a,u)})})}computeViews(e,t,n,s){let i=Be();const a=Pr(),u=function(){return Pr()}();return t.forEach((c,h)=>{const f=n.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof it)?i=i.insert(h.key,h):f!==void 0?(a.set(h.key,f.mutation.getFieldMask()),Sr(f.mutation,h,f.mutation.getFieldMask(),le.now())):a.set(h.key,Le.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((h,f)=>a.set(h,f)),t.forEach((h,f)=>{var g;return u.set(h,new Fp(f,(g=a.get(h))!==null&&g!==void 0?g:null))}),u))}recalculateAndSaveOverlays(e,t){const n=Pr();let s=new se((a,u)=>a-u),i=G();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const u of a)u.keys().forEach(c=>{const h=t.get(c);if(h===null)return;let f=n.get(c)||Le.empty();f=u.applyToLocalView(h,f),n.set(c,f);const g=(s.get(u.batchId)||G()).add(c);s=s.insert(u.batchId,g)})}).next(()=>{const a=[],u=s.getReverseIterator();for(;u.hasNext();){const c=u.getNext(),h=c.key,f=c.value,g=eh();f.forEach(_=>{if(!i.has(_)){const b=ah(t.get(_),n.get(_));b!==null&&g.set(_,b),i=i.add(_)}}),a.push(this.documentOverlayCache.saveOverlays(e,h,g))}return w.waitFor(a)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.recalculateAndSaveOverlays(e,n))}getDocumentsMatchingQuery(e,t,n,s){return function(a){return O.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Bo(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):w.resolve($e());let u=-1,c=i;return a.next(h=>w.forEach(h,(f,g)=>(u<g.largestBatchId&&(u=g.largestBatchId),i.get(f)?w.resolve():this.remoteDocumentCache.getEntry(e,f).next(_=>{c=c.insert(f,_)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,c,h,G())).next(f=>({batchId:u,changes:Zl(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new O(t)).next(n=>{let s=Tr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let a=Tr();return this.indexManager.getCollectionParents(e,i).next(u=>w.forEach(u,c=>{const h=function(g,_){return new rt(_,null,g.explicitOrderBy.slice(),g.filters.slice(),g.limit,g.limitType,g.startAt,g.endAt)}(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,n,s).next(f=>{f.forEach((g,_)=>{a=a.insert(g,_)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s))).next(a=>{i.forEach((c,h)=>{const f=h.getKey();a.get(f)===null&&(a=a.insert(f,oe.newInvalidDocument(f)))});let u=Tr();return a.forEach((c,h)=>{const f=i.get(c);f!==void 0&&Sr(f.mutation,h,Le.empty(),le.now()),$r(t,h)&&(u=u.insert(c,h))}),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lp{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return w.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:pe(s.createTime)}}(t)),w.resolve()}getNamedQuery(e,t){return w.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:Wo(s.bundledQuery),readTime:pe(s.readTime)}}(t)),w.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bp{constructor(){this.overlays=new se(O.comparator),this.Ir=new Map}getOverlay(e,t){return w.resolve(this.overlays.get(t))}getOverlays(e,t){const n=$e();return w.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(e,t,n){return n.forEach((s,i)=>{this.ht(e,t,i)}),w.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Ir.get(n);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(n)),w.resolve()}getOverlaysForCollection(e,t,n){const s=$e(),i=t.length+1,a=new O(t.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){const c=u.getNext().value,h=c.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&c.largestBatchId>n&&s.set(c.getKey(),c)}return w.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new se((h,f)=>h-f);const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>n){let f=i.get(h.largestBatchId);f===null&&(f=$e(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const u=$e(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((h,f)=>u.set(h,f)),!(u.size()>=s)););return w.resolve(u)}ht(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(n.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new Ko(t,n));let i=this.Ir.get(t);i===void 0&&(i=G(),this.Ir.set(t,i)),this.Ir.set(t,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Up{constructor(){this.sessionToken=de.EMPTY_BYTE_STRING}getSessionToken(e){return w.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,w.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yo{constructor(){this.Tr=new te(Ie.Er),this.dr=new te(Ie.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const n=new Ie(e,t);this.Tr=this.Tr.add(n),this.dr=this.dr.add(n)}Rr(e,t){e.forEach(n=>this.addReference(n,t))}removeReference(e,t){this.Vr(new Ie(e,t))}mr(e,t){e.forEach(n=>this.removeReference(n,t))}gr(e){const t=new O(new W([])),n=new Ie(t,e),s=new Ie(t,e+1),i=[];return this.dr.forEachInRange([n,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new O(new W([])),n=new Ie(t,e),s=new Ie(t,e+1);let i=G();return this.dr.forEachInRange([n,s],a=>{i=i.add(a.key)}),i}containsKey(e){const t=new Ie(e,0),n=this.Tr.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class Ie{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return O.comparator(e.key,t.key)||z(e.wr,t.wr)}static Ar(e,t){return z(e.wr,t.wr)||O.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qp{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new te(Ie.Er)}checkEmpty(e){return w.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new zo(i,t,n,s);this.mutationQueue.push(a);for(const u of s)this.br=this.br.add(new Ie(u.key,i)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return w.resolve(a)}lookupMutationBatch(e,t){return w.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.vr(n),i=s<0?0:s;return w.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return w.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return w.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new Ie(t,0),s=new Ie(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([n,s],a=>{const u=this.Dr(a.wr);i.push(u)}),w.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new te(z);return t.forEach(s=>{const i=new Ie(s,0),a=new Ie(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],u=>{n=n.add(u.wr)})}),w.resolve(this.Cr(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;O.isDocumentKey(i)||(i=i.child(""));const a=new Ie(new O(i),0);let u=new te(z);return this.br.forEachWhile(c=>{const h=c.key.path;return!!n.isPrefixOf(h)&&(h.length===s&&(u=u.add(c.wr)),!0)},a),w.resolve(this.Cr(u))}Cr(e){const t=[];return e.forEach(n=>{const s=this.Dr(n);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){L(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let n=this.br;return w.forEach(t.mutations,s=>{const i=new Ie(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=n})}On(e){}containsKey(e,t){const n=new Ie(t,0),s=this.br.firstAfterOrEqual(n);return w.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,w.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jp{constructor(e){this.Mr=e,this.docs=function(){return new se(O.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,a=this.Mr(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return w.resolve(n?n.document.mutableCopy():oe.newInvalidDocument(t))}getEntries(e,t){let n=Be();return t.forEach(s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():oe.newInvalidDocument(s))}),w.resolve(n)}getDocumentsMatchingQuery(e,t,n,s){let i=Be();const a=t.path,u=new O(a.child("")),c=this.docs.getIteratorFrom(u);for(;c.hasNext();){const{key:h,value:{document:f}}=c.getNext();if(!a.isPrefixOf(h.path))break;h.path.length>a.length+1||Mo(Al(f),n)<=0||(s.has(f.key)||$r(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return w.resolve(i)}getAllFromCollectionGroup(e,t,n,s){F()}Or(e,t){return w.forEach(this.docs,n=>t(n))}newChangeBuffer(e){return new zp(this)}getSize(e){return w.resolve(this.size)}}class zp extends Oh{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((n,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(n)}),w.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gp{constructor(e){this.persistence=e,this.Nr=new st(t=>Yt(t),Gr),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Yo,this.targetCount=0,this.kr=nn.Bn()}forEachTarget(e,t){return this.Nr.forEach((n,s)=>t(s)),w.resolve()}getLastRemoteSnapshotVersion(e){return w.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return w.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),w.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.Lr&&(this.Lr=t),w.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new nn(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,w.resolve()}updateTargetData(e,t){return this.Kn(t),w.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,w.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.Nr.forEach((a,u)=>{u.sequenceNumber<=t&&n.get(u.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,u.targetId)),s++)}),w.waitFor(i).next(()=>s)}getTargetCount(e){return w.resolve(this.targetCount)}getTargetData(e,t){const n=this.Nr.get(t)||null;return w.resolve(n)}addMatchingKeys(e,t,n){return this.Br.Rr(t,n),w.resolve()}removeMatchingKeys(e,t,n){this.Br.mr(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),w.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),w.resolve()}getMatchingKeysForTargetId(e,t){const n=this.Br.yr(t);return w.resolve(n)}containsKey(e,t){return w.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xo{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Fe(0),this.Kr=!1,this.Kr=!0,this.$r=new Up,this.referenceDelegate=e(this),this.Ur=new Gp(this),this.indexManager=new Vp,this.remoteDocumentCache=function(s){return new jp(s)}(n=>this.referenceDelegate.Wr(n)),this.serializer=new Ph(t),this.Gr=new Lp(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Bp,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.qr[e.toKey()];return n||(n=new qp(t,this.referenceDelegate),this.qr[e.toKey()]=n),n}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,n){x("MemoryPersistence","Starting transaction:",e);const s=new Kp(this.Qr.next());return this.referenceDelegate.zr(),n(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return w.or(Object.values(this.qr).map(n=>()=>n.containsKey(e,t)))}}class Kp extends Rl{constructor(e){super(),this.currentSequenceNumber=e}}class hi{constructor(e){this.persistence=e,this.Jr=new Yo,this.Yr=null}static Zr(e){return new hi(e)}get Xr(){if(this.Yr)return this.Yr;throw F()}addReference(e,t,n){return this.Jr.addReference(n,t),this.Xr.delete(n.toString()),w.resolve()}removeReference(e,t,n){return this.Jr.removeReference(n,t),this.Xr.add(n.toString()),w.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),w.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>n.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return w.forEach(this.Xr,n=>{const s=O.fromPath(n);return this.ei(e,s).next(i=>{i||t.removeEntry(s,U.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(n=>{n?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return w.or([()=>w.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}class Hs{constructor(e,t){this.persistence=e,this.ti=new st(n=>Ne(n.path),(n,s)=>n.isEqual(s)),this.garbageCollector=Mh(this,t)}static Zr(e,t){return new Hs(e,t)}zr(){}jr(e){return w.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}Yn(e){const t=this.er(e);return this.persistence.getTargetCache().getTargetCount(e).next(n=>t.next(s=>n+s))}er(e){let t=0;return this.Zn(e,n=>{t++}).next(()=>t)}Zn(e,t){return w.forEach(this.ti,(n,s)=>this.nr(e,n,s).next(i=>i?w.resolve():t(s)))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.Or(e,a=>this.nr(e,a,t).next(u=>{u||(n++,i.removeEntry(a,U.min()))})).next(()=>i.apply(e)).next(()=>n)}markPotentiallyOrphaned(e,t){return this.ti.set(t,e.currentSequenceNumber),w.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.ti.set(n,e.currentSequenceNumber),w.resolve()}removeReference(e,t,n){return this.ti.set(n,e.currentSequenceNumber),w.resolve()}updateLimboDocument(e,t){return this.ti.set(t,e.currentSequenceNumber),w.resolve()}Wr(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Ns(e.data.value)),t}nr(e,t,n){return w.or([()=>this.persistence.Hr(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.ti.get(t);return w.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $p{constructor(e){this.serializer=e}O(e,t,n,s){const i=new ni("createOrUpgrade",t);n<1&&s>=1&&(function(c){c.createObjectStore("owner")}(e),function(c){c.createObjectStore("mutationQueues",{keyPath:"userId"}),c.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",Qu,{unique:!0}),c.createObjectStore("documentMutations")}(e),kc(e),function(c){c.createObjectStore("remoteDocuments")}(e));let a=w.resolve();return n<3&&s>=3&&(n!==0&&(function(c){c.deleteObjectStore("targetDocuments"),c.deleteObjectStore("targets"),c.deleteObjectStore("targetGlobal")}(e),kc(e)),a=a.next(()=>function(c){const h=c.store("targetGlobal"),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:U.min().toTimestamp(),targetCount:0};return h.put("targetGlobalKey",f)}(i))),n<4&&s>=4&&(n!==0&&(a=a.next(()=>function(c,h){return h.store("mutations").U().next(f=>{c.deleteObjectStore("mutations"),c.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",Qu,{unique:!0});const g=h.store("mutations"),_=f.map(b=>g.put(b));return w.waitFor(_)})}(e,i))),a=a.next(()=>{(function(c){c.createObjectStore("clientMetadata",{keyPath:"clientId"})})(e)})),n<5&&s>=5&&(a=a.next(()=>this.ni(i))),n<6&&s>=6&&(a=a.next(()=>(function(c){c.createObjectStore("remoteDocumentGlobal")}(e),this.ri(i)))),n<7&&s>=7&&(a=a.next(()=>this.ii(i))),n<8&&s>=8&&(a=a.next(()=>this.si(e,i))),n<9&&s>=9&&(a=a.next(()=>{(function(c){c.objectStoreNames.contains("remoteDocumentChanges")&&c.deleteObjectStore("remoteDocumentChanges")})(e)})),n<10&&s>=10&&(a=a.next(()=>this.oi(i))),n<11&&s>=11&&(a=a.next(()=>{(function(c){c.createObjectStore("bundles",{keyPath:"bundleId"})})(e),function(c){c.createObjectStore("namedQueries",{keyPath:"name"})}(e)})),n<12&&s>=12&&(a=a.next(()=>{(function(c){const h=c.createObjectStore("documentOverlays",{keyPath:Vg});h.createIndex("collectionPathOverlayIndex",Cg,{unique:!1}),h.createIndex("collectionGroupOverlayIndex",Dg,{unique:!1})})(e)})),n<13&&s>=13&&(a=a.next(()=>function(c){const h=c.createObjectStore("remoteDocumentsV14",{keyPath:yg});h.createIndex("documentKeyIndex",Ig),h.createIndex("collectionGroupIndex",Eg)}(e)).next(()=>this._i(e,i)).next(()=>e.deleteObjectStore("remoteDocuments"))),n<14&&s>=14&&(a=a.next(()=>this.ai(e,i))),n<15&&s>=15&&(a=a.next(()=>function(c){c.createObjectStore("indexConfiguration",{keyPath:"indexId",autoIncrement:!0}).createIndex("collectionGroupIndex","collectionGroup",{unique:!1}),c.createObjectStore("indexState",{keyPath:bg}).createIndex("sequenceNumberIndex",Rg,{unique:!1}),c.createObjectStore("indexEntries",{keyPath:Pg}).createIndex("documentKeyIndex",Sg,{unique:!1})}(e))),n<16&&s>=16&&(a=a.next(()=>{t.objectStore("indexState").clear()}).next(()=>{t.objectStore("indexEntries").clear()})),n<17&&s>=17&&(a=a.next(()=>{(function(c){c.createObjectStore("globals",{keyPath:"name"})})(e)})),a}ri(e){let t=0;return e.store("remoteDocuments").J((n,s)=>{t+=Ws(s)}).next(()=>{const n={byteSize:t};return e.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey",n)})}ni(e){const t=e.store("mutationQueues"),n=e.store("mutations");return t.U().next(s=>w.forEach(s,i=>{const a=IDBKeyRange.bound([i.userId,-1],[i.userId,i.lastAcknowledgedBatchId]);return n.U("userMutationsIndex",a).next(u=>w.forEach(u,c=>{L(c.userId===i.userId);const h=Gt(this.serializer,c);return Dh(e,i.userId,h).next(()=>{})}))}))}ii(e){const t=e.store("targetDocuments"),n=e.store("remoteDocuments");return e.store("targetGlobal").get("targetGlobalKey").next(s=>{const i=[];return n.J((a,u)=>{const c=new W(a),h=function(g){return[0,Ne(g)]}(c);i.push(t.get(h).next(f=>f?w.resolve():(g=>t.put({targetId:0,path:Ne(g),sequenceNumber:s.highestListenSequenceNumber}))(c)))}).next(()=>w.waitFor(i))})}si(e,t){e.createObjectStore("collectionParents",{keyPath:Ag});const n=t.store("collectionParents"),s=new Jo,i=a=>{if(s.add(a)){const u=a.lastSegment(),c=a.popLast();return n.put({collectionId:u,parent:Ne(c)})}};return t.store("remoteDocuments").J({H:!0},(a,u)=>{const c=new W(a);return i(c.popLast())}).next(()=>t.store("documentMutations").J({H:!0},([a,u,c],h)=>{const f=Ke(u);return i(f.popLast())}))}oi(e){const t=e.store("targets");return t.J((n,s)=>{const i=wr(s),a=Sh(this.serializer,i);return t.put(a)})}_i(e,t){const n=t.store("remoteDocuments"),s=[];return n.J((i,a)=>{const u=t.store("remoteDocumentsV14"),c=function(g){return g.document?new O(W.fromString(g.document.name).popFirst(5)):g.noDocument?O.fromSegments(g.noDocument.path):g.unknownDocument?O.fromSegments(g.unknownDocument.path):F()}(a).path.toArray(),h={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:a.readTime||[0,0],unknownDocument:a.unknownDocument,noDocument:a.noDocument,document:a.document,hasCommittedMutations:!!a.hasCommittedMutations};s.push(u.put(h))}).next(()=>w.waitFor(s))}ai(e,t){const n=t.store("mutations"),s=Fh(this.serializer),i=new Xo(hi.Zr,this.serializer.ct);return n.U().next(a=>{const u=new Map;return a.forEach(c=>{var h;let f=(h=u.get(c.userId))!==null&&h!==void 0?h:G();Gt(this.serializer,c).keys().forEach(g=>f=f.add(g)),u.set(c.userId,f)}),w.forEach(u,(c,h)=>{const f=new Ee(h),g=ci.lt(this.serializer,f),_=i.getIndexManager(f),b=li.lt(f,this.serializer,_,i.referenceDelegate);return new Lh(s,b,g,_).recalculateAndSaveOverlaysForDocumentKeys(new ho(t,Fe.oe),c).next()})})}}function kc(r){r.createObjectStore("targetDocuments",{keyPath:vg}).createIndex("documentTargetsIndex",wg,{unique:!0}),r.createObjectStore("targets",{keyPath:"targetId"}).createIndex("queryTargetsIndex",Tg,{unique:!0}),r.createObjectStore("targetGlobal")}const eo="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";class Zo{constructor(e,t,n,s,i,a,u,c,h,f,g=17){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.ui=i,this.window=a,this.document=u,this.ci=h,this.li=f,this.hi=g,this.Qr=null,this.Kr=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Pi=null,this.inForeground=!1,this.Ii=null,this.Ti=null,this.Ei=Number.NEGATIVE_INFINITY,this.di=_=>Promise.resolve(),!Zo.D())throw new D(P.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new kp(this,s),this.Ai=t+"main",this.serializer=new Ph(c),this.Ri=new Qe(this.Ai,this.hi,new $p(this.serializer)),this.$r=new wp,this.Ur=new Dp(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Fh(this.serializer),this.Gr=new vp,this.window&&this.window.localStorage?this.Vi=this.window.localStorage:(this.Vi=null,f===!1&&ge("IndexedDbPersistence","LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.mi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new D(P.FAILED_PRECONDITION,eo);return this.fi(),this.gi(),this.pi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.Ur.getHighestSequenceNumber(e))}).then(e=>{this.Qr=new Fe(e,this.ci)}).then(()=>{this.Kr=!0}).catch(e=>(this.Ri&&this.Ri.close(),Promise.reject(e)))}yi(e){return this.di=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.Ri.L(async t=>{t.newVersion===null&&await e()})}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.ui.enqueueAndForget(async()=>{this.started&&await this.mi()}))}mi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>Ps(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.wi(e).next(t=>{t||(this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)))})}).next(()=>this.Si(e)).next(t=>this.isPrimary&&!t?this.bi(e).next(()=>!1):!!t&&this.Di(e).next(()=>!0))).catch(e=>{if(Ct(e))return x("IndexedDbPersistence","Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return x("IndexedDbPersistence","Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.ui.enqueueRetryable(()=>this.di(e)),this.isPrimary=e})}wi(e){return Ir(e).get("owner").next(t=>w.resolve(this.vi(t)))}Ci(e){return Ps(e).delete(this.clientId)}async Fi(){if(this.isPrimary&&!this.Mi(this.Ei,18e5)){this.Ei=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const n=ye(t,"clientMetadata");return n.U().next(s=>{const i=this.xi(s,18e5),a=s.filter(u=>i.indexOf(u)===-1);return w.forEach(a,u=>n.delete(u.clientId)).next(()=>a)})}).catch(()=>[]);if(this.Vi)for(const t of e)this.Vi.removeItem(this.Oi(t.clientId))}}pi(){this.Ti=this.ui.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.mi().then(()=>this.Fi()).then(()=>this.pi()))}vi(e){return!!e&&e.ownerId===this.clientId}Si(e){return this.li?w.resolve(!0):Ir(e).get("owner").next(t=>{if(t!==null&&this.Mi(t.leaseTimestampMs,5e3)&&!this.Ni(t.ownerId)){if(this.vi(t)&&this.networkEnabled)return!0;if(!this.vi(t)){if(!t.allowTabSynchronization)throw new D(P.FAILED_PRECONDITION,eo);return!1}}return!(!this.networkEnabled||!this.inForeground)||Ps(e).U().next(n=>this.xi(n,5e3).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,a=!this.inForeground&&s.inForeground,u=this.networkEnabled===s.networkEnabled;if(i||a&&u)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&x("IndexedDbPersistence",`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.Kr=!1,this.Li(),this.Ti&&(this.Ti.cancel(),this.Ti=null),this.Bi(),this.ki(),await this.Ri.runTransaction("shutdown","readwrite",["owner","clientMetadata"],e=>{const t=new ho(e,Fe.oe);return this.bi(t).next(()=>this.Ci(t))}),this.Ri.close(),this.qi()}xi(e,t){return e.filter(n=>this.Mi(n.updateTimeMs,t)&&!this.Ni(n.clientId))}Qi(){return this.runTransaction("getActiveClients","readonly",e=>Ps(e).U().next(t=>this.xi(t,18e5).map(n=>n.clientId)))}get started(){return this.Kr}getGlobalsCache(){return this.$r}getMutationQueue(e,t){return li.lt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new Cp(e,this.serializer.ct.databaseId)}getDocumentOverlayCache(e){return ci.lt(this.serializer,e)}getBundleCache(){return this.Gr}runTransaction(e,t,n){x("IndexedDbPersistence","Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=function(c){return c===17?kg:c===16?Ng:c===15?Fo:c===14?xl:c===13?Dl:c===12?xg:c===11?Cl:void F()}(this.hi);let a;return this.Ri.runTransaction(e,s,i,u=>(a=new ho(u,this.Qr?this.Qr.next():Fe.oe),t==="readwrite-primary"?this.wi(a).next(c=>!!c||this.Si(a)).next(c=>{if(!c)throw ge(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)),new D(P.FAILED_PRECONDITION,bl);return n(a)}).next(c=>this.Di(a).next(()=>c)):this.Ki(a).next(()=>n(a)))).then(u=>(a.raiseOnCommittedEvent(),u))}Ki(e){return Ir(e).get("owner").next(t=>{if(t!==null&&this.Mi(t.leaseTimestampMs,5e3)&&!this.Ni(t.ownerId)&&!this.vi(t)&&!(this.li||this.allowTabSynchronization&&t.allowTabSynchronization))throw new D(P.FAILED_PRECONDITION,eo)})}Di(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Ir(e).put("owner",t)}static D(){return Qe.D()}bi(e){const t=Ir(e);return t.get("owner").next(n=>this.vi(n)?(x("IndexedDbPersistence","Releasing primary lease."),t.delete("owner")):w.resolve())}Mi(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(ge(`Detected an update time that is in the future: ${e} > ${n}`),!1))}fi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Ii=()=>{this.ui.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.mi()))},this.document.addEventListener("visibilitychange",this.Ii),this.inForeground=this.document.visibilityState==="visible")}Bi(){this.Ii&&(this.document.removeEventListener("visibilitychange",this.Ii),this.Ii=null)}gi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.Pi=()=>{this.Li();const t=/(?:Version|Mobile)\/1[456]/;il()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.ui.enterRestrictedMode(!0),this.ui.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Pi))}ki(){this.Pi&&(this.window.removeEventListener("pagehide",this.Pi),this.Pi=null)}Ni(e){var t;try{const n=((t=this.Vi)===null||t===void 0?void 0:t.getItem(this.Oi(e)))!==null;return x("IndexedDbPersistence",`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return ge("IndexedDbPersistence","Failed to get zombied client id.",n),!1}}Li(){if(this.Vi)try{this.Vi.setItem(this.Oi(this.clientId),String(Date.now()))}catch(e){ge("Failed to set zombie client id.",e)}}qi(){if(this.Vi)try{this.Vi.removeItem(this.Oi(this.clientId))}catch{}}Oi(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Ir(r){return ye(r,"owner")}function Ps(r){return ye(r,"clientMetadata")}function ea(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ta{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.$i=n,this.Ui=s}static Wi(e,t){let n=G(),s=G();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new ta(e,t.fromCache,n,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qp{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bh{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return il()?8:Pl(wn())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.Yi(e,t).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,t,s,n).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new Qp;return this.Xi(e,t,a).next(u=>{if(i.result=u,this.zi)return this.es(e,t,a,u.size)})}).next(()=>i.result)}es(e,t,n,s){return n.documentReadCount<this.ji?(_n()<=Y.DEBUG&&x("QueryEngine","SDK will not create cache indexes for query:",yn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),w.resolve()):(_n()<=Y.DEBUG&&x("QueryEngine","Query:",yn(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.Hi*s?(_n()<=Y.DEBUG&&x("QueryEngine","The SDK decides to create cache indexes for query:",yn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ke(t))):w.resolve())}Yi(e,t){if(oc(t))return w.resolve(null);let n=ke(t);return this.indexManager.getIndexType(e,n).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=Gs(t,null,"F"),n=ke(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next(i=>{const a=G(...i);return this.Ji.getDocuments(e,a).next(u=>this.indexManager.getMinOffset(e,n).next(c=>{const h=this.ts(t,u);return this.ns(t,h,a,c.readTime)?this.Yi(e,Gs(t,null,"F")):this.rs(e,h,t,c)}))})))}Zi(e,t,n,s){return oc(t)||s.isEqual(U.min())?w.resolve(null):this.Ji.getDocuments(e,n).next(i=>{const a=this.ts(t,i);return this.ns(t,a,n,s)?w.resolve(null):(_n()<=Y.DEBUG&&x("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),yn(t)),this.rs(e,a,t,wl(s,-1)).next(u=>u))})}ts(e,t){let n=new te(Yl(e));return t.forEach((s,i)=>{$r(e,i)&&(n=n.add(i))}),n}ns(e,t,n,s){if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,n){return _n()<=Y.DEBUG&&x("QueryEngine","Using full collection scan to execute query:",yn(t)),this.Ji.getDocumentsMatchingQuery(e,t,je.min(),n)}rs(e,t,n,s){return this.Ji.getDocumentsMatchingQuery(e,n,s).next(i=>(t.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wp{constructor(e,t,n,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new se(z),this._s=new st(i=>Yt(i),Gr),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(n)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Lh(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function Uh(r,e,t,n){return new Wp(r,e,t,n)}async function qh(r,e){const t=k(r);return await t.persistence.runTransaction("Handle user change","readonly",n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(n))).next(i=>{const a=[],u=[];let c=G();for(const h of s){a.push(h.batchId);for(const f of h.mutations)c=c.add(f.key)}for(const h of i){u.push(h.batchId);for(const f of h.mutations)c=c.add(f.key)}return t.localDocuments.getDocuments(n,c).next(h=>({hs:h,removedBatchIds:a,addedBatchIds:u}))})})}function Hp(r,e){const t=k(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const s=e.batch.keys(),i=t.cs.newChangeBuffer({trackRemovals:!0});return function(u,c,h,f){const g=h.batch,_=g.keys();let b=w.resolve();return _.forEach(C=>{b=b.next(()=>f.getEntry(c,C)).next(N=>{const V=h.docVersions.get(C);L(V!==null),N.version.compareTo(V)<0&&(g.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),f.addEntry(N)))})}),b.next(()=>u.mutationQueue.removeMutationBatch(c,g))}(t,n,e,i).next(()=>i.apply(n)).next(()=>t.mutationQueue.performConsistencyCheck(n)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(u){let c=G();for(let h=0;h<u.mutationResults.length;++h)u.mutationResults[h].transformResults.length>0&&(c=c.add(u.batch.mutations[h].key));return c}(e))).next(()=>t.localDocuments.getDocuments(n,s))})}function jh(r){const e=k(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function Jp(r,e){const t=k(r),n=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const u=[];e.targetChanges.forEach((f,g)=>{const _=s.get(g);if(!_)return;u.push(t.Ur.removeMatchingKeys(i,f.removedDocuments,g).next(()=>t.Ur.addMatchingKeys(i,f.addedDocuments,g)));let b=_.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(g)!==null?b=b.withResumeToken(de.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):f.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(f.resumeToken,n)),s=s.insert(g,b),function(N,V,q){return N.resumeToken.approximateByteSize()===0||V.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=3e8?!0:q.addedDocuments.size+q.modifiedDocuments.size+q.removedDocuments.size>0}(_,b,f)&&u.push(t.Ur.updateTargetData(i,b))});let c=Be(),h=G();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&u.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),u.push(zh(i,a,e.documentUpdates).next(f=>{c=f.Ps,h=f.Is})),!n.isEqual(U.min())){const f=t.Ur.getLastRemoteSnapshotVersion(i).next(g=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,n));u.push(f)}return w.waitFor(u).next(()=>a.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,c,h)).next(()=>c)}).then(i=>(t.os=s,i))}function zh(r,e,t){let n=G(),s=G();return t.forEach(i=>n=n.add(i)),e.getEntries(r,n).next(i=>{let a=Be();return t.forEach((u,c)=>{const h=i.get(u);c.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(u)),c.isNoDocument()&&c.version.isEqual(U.min())?(e.removeEntry(u,c.readTime),a=a.insert(u,c)):!h.isValidDocument()||c.version.compareTo(h.version)>0||c.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(c),a=a.insert(u,c)):x("LocalStore","Ignoring outdated watch update for ",u,". Current version:",h.version," Watch version:",c.version)}),{Ps:a,Is:s}})}function Yp(r,e){const t=k(r);return t.persistence.runTransaction("Get next mutation batch","readonly",n=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e)))}function xn(r,e){const t=k(r);return t.persistence.runTransaction("Allocate target","readwrite",n=>{let s;return t.Ur.getTargetData(n,e).next(i=>i?(s=i,w.resolve(s)):t.Ur.allocateTargetId(n).next(a=>(s=new Ze(e,a,"TargetPurposeListen",n.currentSequenceNumber),t.Ur.addTargetData(n,s).next(()=>s))))}).then(n=>{const s=t.os.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(n.targetId,n),t._s.set(e,n.targetId)),n})}async function Nn(r,e,t){const n=k(r),s=n.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,a=>n.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!Ct(a))throw a;x("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}n.os=n.os.remove(e),n._s.delete(s.target)}function Js(r,e,t){const n=k(r);let s=U.min(),i=G();return n.persistence.runTransaction("Execute query","readwrite",a=>function(c,h,f){const g=k(c),_=g._s.get(f);return _!==void 0?w.resolve(g.os.get(_)):g.Ur.getTargetData(h,f)}(n,a,ke(e)).next(u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,n.Ur.getMatchingKeysForTargetId(a,u.targetId).next(c=>{i=c})}).next(()=>n.ss.getDocumentsMatchingQuery(a,e,t?s:U.min(),t?i:G())).next(u=>($h(n,Jl(e),u),{documents:u,Ts:i})))}function Gh(r,e){const t=k(r),n=k(t.Ur),s=t.os.get(e);return s?Promise.resolve(s.target):t.persistence.runTransaction("Get target data","readonly",i=>n.ot(i,e).next(a=>a?a.target:null))}function Kh(r,e){const t=k(r),n=t.us.get(e)||U.min();return t.persistence.runTransaction("Get new document changes","readonly",s=>t.cs.getAllFromCollectionGroup(s,e,wl(n,-1),Number.MAX_SAFE_INTEGER)).then(s=>($h(t,e,s),s))}function $h(r,e,t){let n=r.us.get(e)||U.min();t.forEach((s,i)=>{i.readTime.compareTo(n)>0&&(n=i.readTime)}),r.us.set(e,n)}async function Xp(r,e,t,n){const s=k(r);let i=G(),a=Be();for(const h of t){const f=e.Es(h.metadata.name);h.document&&(i=i.add(f));const g=e.ds(h);g.setReadTime(e.As(h.metadata.readTime)),a=a.insert(f,g)}const u=s.cs.newChangeBuffer({trackRemovals:!0}),c=await xn(s,function(f){return ke(qn(W.fromString(`__bundle__/docs/${f}`)))}(n));return s.persistence.runTransaction("Apply bundle documents","readwrite",h=>zh(h,u,a).next(f=>(u.apply(h),f)).next(f=>s.Ur.removeMatchingKeysForTargetId(h,c.targetId).next(()=>s.Ur.addMatchingKeys(h,i,c.targetId)).next(()=>s.localDocuments.getLocalViewOfDocuments(h,f.Ps,f.Is)).next(()=>f.Ps)))}async function Zp(r,e,t=G()){const n=await xn(r,ke(Wo(e.bundledQuery))),s=k(r);return s.persistence.runTransaction("Save named query","readwrite",i=>{const a=pe(e.readTime);if(n.snapshotVersion.compareTo(a)>=0)return s.Gr.saveNamedQuery(i,e);const u=n.withResumeToken(de.EMPTY_BYTE_STRING,a);return s.os=s.os.insert(u.targetId,u),s.Ur.updateTargetData(i,u).next(()=>s.Ur.removeMatchingKeysForTargetId(i,n.targetId)).next(()=>s.Ur.addMatchingKeys(i,t,n.targetId)).next(()=>s.Gr.saveNamedQuery(i,e))})}function Mc(r,e){return`firestore_clients_${r}_${e}`}function Oc(r,e,t){let n=`firestore_mutations_${r}_${t}`;return e.isAuthenticated()&&(n+=`_${e.uid}`),n}function to(r,e){return`firestore_targets_${r}_${e}`}class Ys{constructor(e,t,n,s){this.user=e,this.batchId=t,this.state=n,this.error=s}static Rs(e,t,n){const s=JSON.parse(n);let i,a=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return a&&s.error&&(a=typeof s.error.message=="string"&&typeof s.error.code=="string",a&&(i=new D(s.error.code,s.error.message))),a?new Ys(e,t,s.state,i):(ge("SharedClientState",`Failed to parse mutation state for ID '${t}': ${n}`),null)}Vs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Vr{constructor(e,t,n){this.targetId=e,this.state=t,this.error=n}static Rs(e,t){const n=JSON.parse(t);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new D(n.error.code,n.error.message))),i?new Vr(e,n.state,s):(ge("SharedClientState",`Failed to parse target state for ID '${e}': ${t}`),null)}Vs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Xs{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Rs(e,t){const n=JSON.parse(t);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=Uo();for(let a=0;s&&a<n.activeTargetIds.length;++a)s=Sl(n.activeTargetIds[a]),i=i.add(n.activeTargetIds[a]);return s?new Xs(e,i):(ge("SharedClientState",`Failed to parse client data for instance '${e}': ${t}`),null)}}class na{constructor(e,t){this.clientId=e,this.onlineState=t}static Rs(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new na(t.clientId,t.onlineState):(ge("SharedClientState",`Failed to parse online state: ${e}`),null)}}class Ro{constructor(){this.activeTargetIds=Uo()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class no{constructor(e,t,n,s,i){this.window=e,this.ui=t,this.persistenceKey=n,this.ps=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ys=this.ws.bind(this),this.Ss=new se(z),this.started=!1,this.bs=[];const a=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Ds=Mc(this.persistenceKey,this.ps),this.vs=function(c){return`firestore_sequence_number_${c}`}(this.persistenceKey),this.Ss=this.Ss.insert(this.ps,new Ro),this.Cs=new RegExp(`^firestore_clients_${a}_([^_]*)$`),this.Fs=new RegExp(`^firestore_mutations_${a}_(\\d+)(?:_(.*))?$`),this.Ms=new RegExp(`^firestore_targets_${a}_(\\d+)$`),this.xs=function(c){return`firestore_online_state_${c}`}(this.persistenceKey),this.Os=function(c){return`firestore_bundle_loaded_v2_${c}`}(this.persistenceKey),this.window.addEventListener("storage",this.ys)}static D(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Qi();for(const n of e){if(n===this.ps)continue;const s=this.getItem(Mc(this.persistenceKey,n));if(s){const i=Xs.Rs(n,s);i&&(this.Ss=this.Ss.insert(i.clientId,i))}}this.Ns();const t=this.storage.getItem(this.xs);if(t){const n=this.Ls(t);n&&this.Bs(n)}for(const n of this.bs)this.ws(n);this.bs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(e){this.setItem(this.vs,JSON.stringify(e))}getAllActiveQueryTargets(){return this.ks(this.Ss)}isActiveQueryTarget(e){let t=!1;return this.Ss.forEach((n,s)=>{s.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.qs(e,"pending")}updateMutationState(e,t,n){this.qs(e,t,n),this.Qs(e)}addLocalQueryTarget(e,t=!0){let n="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(to(this.persistenceKey,e));if(s){const i=Vr.Rs(e,s);i&&(n=i.state)}}return t&&this.Ks.fs(e),this.Ns(),n}removeLocalQueryTarget(e){this.Ks.gs(e),this.Ns()}isLocalQueryTarget(e){return this.Ks.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(to(this.persistenceKey,e))}updateQueryState(e,t,n){this.$s(e,t,n)}handleUserChange(e,t,n){t.forEach(s=>{this.Qs(s)}),this.currentUser=e,n.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(e){this.Us(e)}notifyBundleLoaded(e){this.Ws(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ys),this.removeItem(this.Ds),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return x("SharedClientState","READ",e,t),t}setItem(e,t){x("SharedClientState","SET",e,t),this.storage.setItem(e,t)}removeItem(e){x("SharedClientState","REMOVE",e),this.storage.removeItem(e)}ws(e){const t=e;if(t.storageArea===this.storage){if(x("SharedClientState","EVENT",t.key,t.newValue),t.key===this.Ds)return void ge("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.ui.enqueueRetryable(async()=>{if(this.started){if(t.key!==null){if(this.Cs.test(t.key)){if(t.newValue==null){const n=this.Gs(t.key);return this.zs(n,null)}{const n=this.js(t.key,t.newValue);if(n)return this.zs(n.clientId,n)}}else if(this.Fs.test(t.key)){if(t.newValue!==null){const n=this.Hs(t.key,t.newValue);if(n)return this.Js(n)}}else if(this.Ms.test(t.key)){if(t.newValue!==null){const n=this.Ys(t.key,t.newValue);if(n)return this.Zs(n)}}else if(t.key===this.xs){if(t.newValue!==null){const n=this.Ls(t.newValue);if(n)return this.Bs(n)}}else if(t.key===this.vs){const n=function(i){let a=Fe.oe;if(i!=null)try{const u=JSON.parse(i);L(typeof u=="number"),a=u}catch(u){ge("SharedClientState","Failed to read sequence number from WebStorage",u)}return a}(t.newValue);n!==Fe.oe&&this.sequenceNumberHandler(n)}else if(t.key===this.Os){const n=this.Xs(t.newValue);await Promise.all(n.map(s=>this.syncEngine.eo(s)))}}}else this.bs.push(t)})}}get Ks(){return this.Ss.get(this.ps)}Ns(){this.setItem(this.Ds,this.Ks.Vs())}qs(e,t,n){const s=new Ys(this.currentUser,e,t,n),i=Oc(this.persistenceKey,this.currentUser,e);this.setItem(i,s.Vs())}Qs(e){const t=Oc(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Us(e){const t={clientId:this.ps,onlineState:e};this.storage.setItem(this.xs,JSON.stringify(t))}$s(e,t,n){const s=to(this.persistenceKey,e),i=new Vr(e,t,n);this.setItem(s,i.Vs())}Ws(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Os,t)}Gs(e){const t=this.Cs.exec(e);return t?t[1]:null}js(e,t){const n=this.Gs(e);return Xs.Rs(n,t)}Hs(e,t){const n=this.Fs.exec(e),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return Ys.Rs(new Ee(i),s,t)}Ys(e,t){const n=this.Ms.exec(e),s=Number(n[1]);return Vr.Rs(s,t)}Ls(e){return na.Rs(e)}Xs(e){return JSON.parse(e)}async Js(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.no(e.batchId,e.state,e.error);x("SharedClientState",`Ignoring mutation for non-active user ${e.user.uid}`)}Zs(e){return this.syncEngine.ro(e.targetId,e.state,e.error)}zs(e,t){const n=t?this.Ss.insert(e,t):this.Ss.remove(e),s=this.ks(this.Ss),i=this.ks(n),a=[],u=[];return i.forEach(c=>{s.has(c)||a.push(c)}),s.forEach(c=>{i.has(c)||u.push(c)}),this.syncEngine.io(a,u).then(()=>{this.Ss=n})}Bs(e){this.Ss.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}ks(e){let t=Uo();return e.forEach((n,s)=>{t=t.unionWith(s.activeTargetIds)}),t}}class Qh{constructor(){this.so=new Ro,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,n){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Ro,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class e_{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fc{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){x("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){x("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ss=null;function ro(){return Ss===null?Ss=function(){return 268435456+Math.round(2147483648*Math.random())}():Ss++,"0x"+Ss.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t_={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n_{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const De="WebChannelConnection";class r_ extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const n=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=n+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,n,s,i,a){const u=ro(),c=this.xo(t,n.toUriEncodedString());x("RestConnection",`Sending RPC '${t}' ${u}:`,c,s);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,i,a),this.No(t,c,h,s).then(f=>(x("RestConnection",`Received RPC '${t}' ${u}: `,f),f),f=>{throw qe("RestConnection",`RPC '${t}' ${u} failed with error: `,f,"url: ",c,"request:",s),f})}Lo(t,n,s,i,a,u){return this.Mo(t,n,s,i,a)}Oo(t,n,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Un}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((i,a)=>t[a]=i),s&&s.headers.forEach((i,a)=>t[a]=i)}xo(t,n){const s=t_[t];return`${this.Do}/v1/${n}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,n,s){const i=ro();return new Promise((a,u)=>{const c=new ml;c.setWithCredentials(!0),c.listenOnce(gl.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Cs.NO_ERROR:const f=c.getResponseJson();x(De,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(f)),a(f);break;case Cs.TIMEOUT:x(De,`RPC '${e}' ${i} timed out`),u(new D(P.DEADLINE_EXCEEDED,"Request time out"));break;case Cs.HTTP_ERROR:const g=c.getStatus();if(x(De,`RPC '${e}' ${i} failed with status:`,g,"response text:",c.getResponseText()),g>0){let _=c.getResponseJson();Array.isArray(_)&&(_=_[0]);const b=_==null?void 0:_.error;if(b&&b.status&&b.message){const C=function(V){const q=V.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(q)>=0?q:P.UNKNOWN}(b.status);u(new D(C,b.message))}else u(new D(P.UNKNOWN,"Server responded with status "+c.getStatus()))}else u(new D(P.UNAVAILABLE,"Connection failed."));break;default:F()}}finally{x(De,`RPC '${e}' ${i} completed.`)}});const h=JSON.stringify(s);x(De,`RPC '${e}' ${i} sending request:`,s),c.send(t,"POST",h,n,15)})}Bo(e,t,n){const s=ro(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=yl(),u=_l(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(c.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,t,n),c.encodeInitMessageHeaders=!0;const f=i.join("");x(De,`Creating RPC '${e}' stream ${s}: ${f}`,c);const g=a.createWebChannel(f,c);let _=!1,b=!1;const C=new n_({Io:V=>{b?x(De,`Not sending because RPC '${e}' stream ${s} is closed:`,V):(_||(x(De,`Opening RPC '${e}' stream ${s} transport.`),g.open(),_=!0),x(De,`RPC '${e}' stream ${s} sending:`,V),g.send(V))},To:()=>g.close()}),N=(V,q,j)=>{V.listen(q,B=>{try{j(B)}catch($){setTimeout(()=>{throw $},0)}})};return N(g,Er.EventType.OPEN,()=>{b||(x(De,`RPC '${e}' stream ${s} transport opened.`),C.yo())}),N(g,Er.EventType.CLOSE,()=>{b||(b=!0,x(De,`RPC '${e}' stream ${s} transport closed`),C.So())}),N(g,Er.EventType.ERROR,V=>{b||(b=!0,qe(De,`RPC '${e}' stream ${s} transport errored:`,V),C.So(new D(P.UNAVAILABLE,"The operation could not be completed")))}),N(g,Er.EventType.MESSAGE,V=>{var q;if(!b){const j=V.data[0];L(!!j);const B=j,$=B.error||((q=B[0])===null||q===void 0?void 0:q.error);if($){x(De,`RPC '${e}' stream ${s} received error:`,$);const Z=$.status;let K=function(I){const T=_e[I];if(T!==void 0)return hh(T)}(Z),E=$.message;K===void 0&&(K=P.INTERNAL,E="Unknown error status: "+Z+" with message "+$.message),b=!0,C.So(new D(K,E)),g.close()}else x(De,`RPC '${e}' stream ${s} received:`,j),C.bo(j)}}),N(u,pl.STAT_EVENT,V=>{V.stat===co.PROXY?x(De,`RPC '${e}' stream ${s} detected buffering proxy`):V.stat===co.NOPROXY&&x(De,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{C.wo()},0),C}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wh(){return typeof window<"u"?window:null}function Fs(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jr(r){return new hp(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ra{constructor(e,t,n=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=n,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),n=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-n);s>0&&x("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hh{constructor(e,t,n,s,i,a,u,c){this.ui=e,this.Ho=n,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new ra(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===P.RESOURCE_EXHAUSTED?(ge(t.toString()),ge("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===P.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,s])=>{this.Yo===t&&this.P_(n,s)},n=>{e(()=>{const s=new D(P.UNKNOWN,"Fetching auth token failed: "+n.message);return this.I_(s)})})}P_(e,t){const n=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{n(()=>this.listener.Eo())}),this.stream.Ro(()=>{n(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{n(()=>this.I_(s))}),this.stream.onMessage(s=>{n(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return x("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(x("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class s_ extends Hh{constructor(e,t,n,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,a),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=mp(this.serializer,e),n=function(i){if(!("targetChange"in i))return U.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?U.min():a.readTime?pe(a.readTime):U.min()}(e);return this.listener.d_(t,n)}A_(e){const t={};t.database=To(this.serializer),t.addTarget=function(i,a){let u;const c=a.target;if(u=js(c)?{documents:Th(i,c)}:{query:ui(i,c)._t},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=gh(i,a.resumeToken);const h=Io(i,a.expectedCount);h!==null&&(u.expectedCount=h)}else if(a.snapshotVersion.compareTo(U.min())>0){u.readTime=Dn(i,a.snapshotVersion.toTimestamp());const h=Io(i,a.expectedCount);h!==null&&(u.expectedCount=h)}return u}(this.serializer,e);const n=pp(this.serializer,e);n&&(t.labels=n),this.a_(t)}R_(e){const t={};t.database=To(this.serializer),t.removeTarget=e,this.a_(t)}}class i_ extends Hh{constructor(e,t,n,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return L(!!e.streamToken),this.lastStreamToken=e.streamToken,L(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){L(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=gp(e.writeResults,e.commitTime),n=pe(e.commitTime);return this.listener.g_(n,t)}p_(){const e={};e.database=To(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(n=>Ur(this.serializer,n))};this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class o_ extends class{}{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new D(P.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,n,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,Eo(t,n),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new D(P.UNKNOWN,i.toString())})}Lo(e,t,n,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,u])=>this.connection.Lo(e,Eo(t,n),s,a,u,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new D(P.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class a_{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(ge(t),this.D_=!1):x("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u_{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{n.enqueueAndForget(async()=>{xt(this)&&(x("RemoteStore","Restarting streams for network reachability change."),await async function(c){const h=k(c);h.L_.add(4),await Gn(h),h.q_.set("Unknown"),h.L_.delete(4),await Yr(h)}(this))})}),this.q_=new a_(n,s)}}async function Yr(r){if(xt(r))for(const e of r.B_)await e(!0)}async function Gn(r){for(const e of r.B_)await e(!1)}function di(r,e){const t=k(r);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),oa(t)?ia(t):$n(t).r_()&&sa(t,e))}function kn(r,e){const t=k(r),n=$n(t);t.N_.delete(e),n.r_()&&Jh(t,e),t.N_.size===0&&(n.r_()?n.o_():xt(t)&&t.q_.set("Unknown"))}function sa(r,e){if(r.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(U.min())>0){const t=r.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}$n(r).A_(e)}function Jh(r,e){r.Q_.xe(e),$n(r).R_(e)}function ia(r){r.Q_=new ap({getRemoteKeysForTarget:e=>r.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>r.N_.get(e)||null,tt:()=>r.datastore.serializer.databaseId}),$n(r).start(),r.q_.v_()}function oa(r){return xt(r)&&!$n(r).n_()&&r.N_.size>0}function xt(r){return k(r).L_.size===0}function Yh(r){r.Q_=void 0}async function c_(r){r.q_.set("Online")}async function l_(r){r.N_.forEach((e,t)=>{sa(r,e)})}async function h_(r,e){Yh(r),oa(r)?(r.q_.M_(e),ia(r)):r.q_.set("Unknown")}async function d_(r,e,t){if(r.q_.set("Online"),e instanceof mh&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const u of i.targetIds)s.N_.has(u)&&(await s.remoteSyncer.rejectListen(u,a),s.N_.delete(u),s.Q_.removeTarget(u))}(r,e)}catch(n){x("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Zs(r,n)}else if(e instanceof Os?r.Q_.Ke(e):e instanceof fh?r.Q_.He(e):r.Q_.We(e),!t.isEqual(U.min()))try{const n=await jh(r.localStore);t.compareTo(n)>=0&&await function(i,a){const u=i.Q_.rt(a);return u.targetChanges.forEach((c,h)=>{if(c.resumeToken.approximateByteSize()>0){const f=i.N_.get(h);f&&i.N_.set(h,f.withResumeToken(c.resumeToken,a))}}),u.targetMismatches.forEach((c,h)=>{const f=i.N_.get(c);if(!f)return;i.N_.set(c,f.withResumeToken(de.EMPTY_BYTE_STRING,f.snapshotVersion)),Jh(i,c);const g=new Ze(f.target,c,h,f.sequenceNumber);sa(i,g)}),i.remoteSyncer.applyRemoteEvent(u)}(r,t)}catch(n){x("RemoteStore","Failed to raise snapshot:",n),await Zs(r,n)}}async function Zs(r,e,t){if(!Ct(e))throw e;r.L_.add(1),await Gn(r),r.q_.set("Offline"),t||(t=()=>jh(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{x("RemoteStore","Retrying IndexedDB access"),await t(),r.L_.delete(1),await Yr(r)})}function Xh(r,e){return e().catch(t=>Zs(r,t,e))}async function Kn(r){const e=k(r),t=bt(e);let n=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;f_(e);)try{const s=await Yp(e.localStore,n);if(s===null){e.O_.length===0&&t.o_();break}n=s.batchId,m_(e,s)}catch(s){await Zs(e,s)}Zh(e)&&ed(e)}function f_(r){return xt(r)&&r.O_.length<10}function m_(r,e){r.O_.push(e);const t=bt(r);t.r_()&&t.V_&&t.m_(e.mutations)}function Zh(r){return xt(r)&&!bt(r).n_()&&r.O_.length>0}function ed(r){bt(r).start()}async function g_(r){bt(r).p_()}async function p_(r){const e=bt(r);for(const t of r.O_)e.m_(t.mutations)}async function __(r,e,t){const n=r.O_.shift(),s=Go.from(n,e,t);await Xh(r,()=>r.remoteSyncer.applySuccessfulWrite(s)),await Kn(r)}async function y_(r,e){e&&bt(r).V_&&await async function(n,s){if(function(a){return lh(a)&&a!==P.ABORTED}(s.code)){const i=n.O_.shift();bt(n).s_(),await Xh(n,()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Kn(n)}}(r,e),Zh(r)&&ed(r)}async function Lc(r,e){const t=k(r);t.asyncQueue.verifyOperationInProgress(),x("RemoteStore","RemoteStore received new credentials");const n=xt(t);t.L_.add(3),await Gn(t),n&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Yr(t)}async function Po(r,e){const t=k(r);e?(t.L_.delete(2),await Yr(t)):e||(t.L_.add(2),await Gn(t),t.q_.set("Unknown"))}function $n(r){return r.K_||(r.K_=function(t,n,s){const i=k(t);return i.w_(),new s_(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Eo:c_.bind(null,r),Ro:l_.bind(null,r),mo:h_.bind(null,r),d_:d_.bind(null,r)}),r.B_.push(async e=>{e?(r.K_.s_(),oa(r)?ia(r):r.q_.set("Unknown")):(await r.K_.stop(),Yh(r))})),r.K_}function bt(r){return r.U_||(r.U_=function(t,n,s){const i=k(t);return i.w_(),new i_(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Eo:()=>Promise.resolve(),Ro:g_.bind(null,r),mo:y_.bind(null,r),f_:p_.bind(null,r),g_:__.bind(null,r)}),r.B_.push(async e=>{e?(r.U_.s_(),await Kn(r)):(await r.U_.stop(),r.O_.length>0&&(x("RemoteStore",`Stopping write stream with ${r.O_.length} pending writes`),r.O_=[]))})),r.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aa{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Te,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const a=Date.now()+n,u=new aa(e,t,a,s,i);return u.start(n),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(P.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Qn(r,e){if(ge("AsyncQueue",`${e}: ${r}`),Ct(r))return new D(P.UNAVAILABLE,`${e}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn{constructor(e){this.comparator=e?(t,n)=>e(t,n)||O.comparator(t.key,n.key):(t,n)=>O.comparator(t.key,n.key),this.keyedMap=Tr(),this.sortedSet=new se(this.comparator)}static emptySet(e){return new vn(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,n)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof vn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new vn;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bc{constructor(){this.W_=new se(O.comparator)}track(e){const t=e.doc.key,n=this.W_.get(t);n?e.type!==0&&n.type===3?this.W_=this.W_.insert(t,e):e.type===3&&n.type!==1?this.W_=this.W_.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.W_=this.W_.remove(t):e.type===1&&n.type===2?this.W_=this.W_.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):F():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,n)=>{e.push(n)}),e}}class Mn{constructor(e,t,n,s,i,a,u,c,h){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=c,this.hasCachedResults=h}static fromInitialDocuments(e,t,n,s,i){const a=[];return t.forEach(u=>{a.push({type:0,doc:u})}),new Mn(e,t,vn.emptySet(t),a,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Kr(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I_{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class E_{constructor(){this.queries=Uc(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,n){const s=k(t),i=s.queries;s.queries=Uc(),i.forEach((a,u)=>{for(const c of u.j_)c.onError(n)})})(this,new D(P.ABORTED,"Firestore shutting down"))}}function Uc(){return new st(r=>Hl(r),Kr)}async function ua(r,e){const t=k(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(n=2):(i=new I_,n=e.J_()?0:1);try{switch(n){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const u=Qn(a,`Initialization of query '${yn(e.query)}' failed`);return void e.onError(u)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&la(t)}async function ca(r,e){const t=k(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function T_(r,e){const t=k(r);let n=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const u of a.j_)u.X_(s)&&(n=!0);a.z_=s}}n&&la(t)}function v_(r,e,t){const n=k(r),s=n.queries.get(e);if(s)for(const i of s.j_)i.onError(t);n.queries.delete(e)}function la(r){r.Y_.forEach(e=>{e.next()})}var So,qc;(qc=So||(So={})).ea="default",qc.Cache="cache";class ha{constructor(e,t,n){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=n||{}}X_(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new Mn(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const n=t!=="Offline";return(!this.options._a||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Mn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==So.Cache}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w_{constructor(e,t){this.aa=e,this.byteLength=t}ua(){return"metadata"in this.aa}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jc{constructor(e){this.serializer=e}Es(e){return We(this.serializer,e)}ds(e){return e.metadata.exists?Eh(this.serializer,e.document,!1):oe.newNoDocument(this.Es(e.metadata.name),this.As(e.metadata.readTime))}As(e){return pe(e)}}class A_{constructor(e,t,n){this.ca=e,this.localStore=t,this.serializer=n,this.queries=[],this.documents=[],this.collectionGroups=new Set,this.progress=td(e)}la(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.aa.namedQuery)this.queries.push(e.aa.namedQuery);else if(e.aa.documentMetadata){this.documents.push({metadata:e.aa.documentMetadata}),e.aa.documentMetadata.exists||++t;const n=W.fromString(e.aa.documentMetadata.name);this.collectionGroups.add(n.get(n.length-2))}else e.aa.document&&(this.documents[this.documents.length-1].document=e.aa.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,Object.assign({},this.progress)):null}ha(e){const t=new Map,n=new jc(this.serializer);for(const s of e)if(s.metadata.queries){const i=n.Es(s.metadata.name);for(const a of s.metadata.queries){const u=(t.get(a)||G()).add(i);t.set(a,u)}}return t}async complete(){const e=await Xp(this.localStore,new jc(this.serializer),this.documents,this.ca.id),t=this.ha(this.documents);for(const n of this.queries)await Zp(this.localStore,n,t.get(n.name));return this.progress.taskState="Success",{progress:this.progress,Pa:this.collectionGroups,Ia:e}}}function td(r){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:r.totalDocuments,totalBytes:r.totalBytes}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nd{constructor(e){this.key=e}}class rd{constructor(e){this.key=e}}class sd{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=G(),this.mutatedKeys=G(),this.Aa=Yl(e),this.Ra=new vn(this.Aa)}get Va(){return this.Ta}ma(e,t){const n=t?t.fa:new Bc,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,u=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,g)=>{const _=s.get(f),b=$r(this.query,g)?g:null,C=!!_&&this.mutatedKeys.has(_.key),N=!!b&&(b.hasLocalMutations||this.mutatedKeys.has(b.key)&&b.hasCommittedMutations);let V=!1;_&&b?_.data.isEqual(b.data)?C!==N&&(n.track({type:3,doc:b}),V=!0):this.ga(_,b)||(n.track({type:2,doc:b}),V=!0,(c&&this.Aa(b,c)>0||h&&this.Aa(b,h)<0)&&(u=!0)):!_&&b?(n.track({type:0,doc:b}),V=!0):_&&!b&&(n.track({type:1,doc:_}),V=!0,(c||h)&&(u=!0)),V&&(b?(a=a.add(b),i=N?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),n.track({type:1,doc:f})}return{Ra:a,fa:n,ns:u,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,g)=>function(b,C){const N=V=>{switch(V){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return F()}};return N(b)-N(C)}(f.type,g.type)||this.Aa(f.doc,g.doc)),this.pa(n),s=s!=null&&s;const u=t&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,h=c!==this.Ea;return this.Ea=c,a.length!==0||h?{snapshot:new Mn(this.query,e.Ra,i,a,e.mutatedKeys,c===0,h,!1,!!n&&n.resumeToken.approximateByteSize()>0),wa:u}:{wa:u}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Bc,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=G(),this.Ra.forEach(n=>{this.Sa(n.key)&&(this.da=this.da.add(n.key))});const t=[];return e.forEach(n=>{this.da.has(n)||t.push(new rd(n))}),this.da.forEach(n=>{e.has(n)||t.push(new nd(n))}),t}ba(e){this.Ta=e.Ts,this.da=G();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Mn.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class b_{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class R_{constructor(e){this.key=e,this.va=!1}}class P_{constructor(e,t,n,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new st(u=>Hl(u),Kr),this.Ma=new Map,this.xa=new Set,this.Oa=new se(O.comparator),this.Na=new Map,this.La=new Yo,this.Ba={},this.ka=new Map,this.qa=nn.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function S_(r,e,t=!0){const n=fi(r);let s;const i=n.Fa.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await id(n,e,t,!0),s}async function V_(r,e){const t=fi(r);await id(t,e,!0,!1)}async function id(r,e,t,n){const s=await xn(r.localStore,ke(e)),i=s.targetId,a=r.sharedClientState.addLocalQueryTarget(i,t);let u;return n&&(u=await da(r,e,i,a==="current",s.resumeToken)),r.isPrimaryClient&&t&&di(r.remoteStore,s),u}async function da(r,e,t,n,s){r.Ka=(g,_,b)=>async function(N,V,q,j){let B=V.view.ma(q);B.ns&&(B=await Js(N.localStore,V.query,!1).then(({documents:E})=>V.view.ma(E,B)));const $=j&&j.targetChanges.get(V.targetId),Z=j&&j.targetMismatches.get(V.targetId)!=null,K=V.view.applyChanges(B,N.isPrimaryClient,$,Z);return Vo(N,V.targetId,K.wa),K.snapshot}(r,g,_,b);const i=await Js(r.localStore,e,!0),a=new sd(e,i.Ts),u=a.ma(i.documents),c=Hr.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),h=a.applyChanges(u,r.isPrimaryClient,c);Vo(r,t,h.wa);const f=new b_(e,t,a);return r.Fa.set(e,f),r.Ma.has(t)?r.Ma.get(t).push(e):r.Ma.set(t,[e]),h.snapshot}async function C_(r,e,t){const n=k(r),s=n.Fa.get(e),i=n.Ma.get(s.targetId);if(i.length>1)return n.Ma.set(s.targetId,i.filter(a=>!Kr(a,e))),void n.Fa.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await Nn(n.localStore,s.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(s.targetId),t&&kn(n.remoteStore,s.targetId),On(n,s.targetId)}).catch(Vt)):(On(n,s.targetId),await Nn(n.localStore,s.targetId,!0))}async function D_(r,e){const t=k(r),n=t.Fa.get(e),s=t.Ma.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),kn(t.remoteStore,n.targetId))}async function x_(r,e,t){const n=pa(r);try{const s=await function(a,u){const c=k(a),h=le.now(),f=u.reduce((b,C)=>b.add(C.key),G());let g,_;return c.persistence.runTransaction("Locally write mutations","readwrite",b=>{let C=Be(),N=G();return c.cs.getEntries(b,f).next(V=>{C=V,C.forEach((q,j)=>{j.isValidDocument()||(N=N.add(q))})}).next(()=>c.localDocuments.getOverlayedDocuments(b,C)).next(V=>{g=V;const q=[];for(const j of u){const B=sp(j,g.get(j.key).overlayedDocument);B!=null&&q.push(new it(j.key,B,Ll(B.value.mapValue),ce.exists(!0)))}return c.mutationQueue.addMutationBatch(b,h,q,u)}).next(V=>{_=V;const q=V.applyToLocalDocumentSet(g,N);return c.documentOverlayCache.saveOverlays(b,V.batchId,q)})}).then(()=>({batchId:_.batchId,changes:Zl(g)}))}(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),function(a,u,c){let h=a.Ba[a.currentUser.toKey()];h||(h=new se(z)),h=h.insert(u,c),a.Ba[a.currentUser.toKey()]=h}(n,s.batchId,t),await ot(n,s.changes),await Kn(n.remoteStore)}catch(s){const i=Qn(s,"Failed to persist write");t.reject(i)}}async function od(r,e){const t=k(r);try{const n=await Jp(t.localStore,e);e.targetChanges.forEach((s,i)=>{const a=t.Na.get(i);a&&(L(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?L(a.va):s.removedDocuments.size>0&&(L(a.va),a.va=!1))}),await ot(t,n,e)}catch(n){await Vt(n)}}function zc(r,e,t){const n=k(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.Fa.forEach((i,a)=>{const u=a.view.Z_(e);u.snapshot&&s.push(u.snapshot)}),function(a,u){const c=k(a);c.onlineState=u;let h=!1;c.queries.forEach((f,g)=>{for(const _ of g.j_)_.Z_(u)&&(h=!0)}),h&&la(c)}(n.eventManager,e),s.length&&n.Ca.d_(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function N_(r,e,t){const n=k(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.Na.get(e),i=s&&s.key;if(i){let a=new se(O.comparator);a=a.insert(i,oe.newNoDocument(i,U.min()));const u=G().add(i),c=new Wr(U.min(),new Map,new se(z),a,u);await od(n,c),n.Oa=n.Oa.remove(i),n.Na.delete(e),ga(n)}else await Nn(n.localStore,e,!1).then(()=>On(n,e,t)).catch(Vt)}async function k_(r,e){const t=k(r),n=e.batch.batchId;try{const s=await Hp(t.localStore,e);ma(t,n,null),fa(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await ot(t,s)}catch(s){await Vt(s)}}async function M_(r,e,t){const n=k(r);try{const s=await function(a,u){const c=k(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return c.mutationQueue.lookupMutationBatch(h,u).next(g=>(L(g!==null),f=g.keys(),c.mutationQueue.removeMutationBatch(h,g))).next(()=>c.mutationQueue.performConsistencyCheck(h)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(h,f,u)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>c.localDocuments.getDocuments(h,f))})}(n.localStore,e);ma(n,e,t),fa(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await ot(n,s)}catch(s){await Vt(s)}}async function O_(r,e){const t=k(r);xt(t.remoteStore)||x("SyncEngine","The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const n=await function(a){const u=k(a);return u.persistence.runTransaction("Get highest unacknowledged batch id","readonly",c=>u.mutationQueue.getHighestUnacknowledgedBatchId(c))}(t.localStore);if(n===-1)return void e.resolve();const s=t.ka.get(n)||[];s.push(e),t.ka.set(n,s)}catch(n){const s=Qn(n,"Initialization of waitForPendingWrites() operation failed");e.reject(s)}}function fa(r,e){(r.ka.get(e)||[]).forEach(t=>{t.resolve()}),r.ka.delete(e)}function ma(r,e,t){const n=k(r);let s=n.Ba[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.Ba[n.currentUser.toKey()]=s}}function On(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.Ma.get(e))r.Fa.delete(n),t&&r.Ca.$a(n,t);r.Ma.delete(e),r.isPrimaryClient&&r.La.gr(e).forEach(n=>{r.La.containsKey(n)||ad(r,n)})}function ad(r,e){r.xa.delete(e.path.canonicalString());const t=r.Oa.get(e);t!==null&&(kn(r.remoteStore,t),r.Oa=r.Oa.remove(e),r.Na.delete(t),ga(r))}function Vo(r,e,t){for(const n of t)n instanceof nd?(r.La.addReference(n.key,e),F_(r,n)):n instanceof rd?(x("SyncEngine","Document no longer in limbo: "+n.key),r.La.removeReference(n.key,e),r.La.containsKey(n.key)||ad(r,n.key)):F()}function F_(r,e){const t=e.key,n=t.path.canonicalString();r.Oa.get(t)||r.xa.has(n)||(x("SyncEngine","New document in limbo: "+t),r.xa.add(n),ga(r))}function ga(r){for(;r.xa.size>0&&r.Oa.size<r.maxConcurrentLimboResolutions;){const e=r.xa.values().next().value;r.xa.delete(e);const t=new O(W.fromString(e)),n=r.qa.next();r.Na.set(n,new R_(t)),r.Oa=r.Oa.insert(t,n),di(r.remoteStore,new Ze(ke(qn(t.path)),n,"TargetPurposeLimboResolution",Fe.oe))}}async function ot(r,e,t){const n=k(r),s=[],i=[],a=[];n.Fa.isEmpty()||(n.Fa.forEach((u,c)=>{a.push(n.Ka(c,e,t).then(h=>{var f;if((h||t)&&n.isPrimaryClient){const g=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(c.targetId))===null||f===void 0?void 0:f.current;n.sharedClientState.updateQueryState(c.targetId,g?"current":"not-current")}if(h){s.push(h);const g=ta.Wi(c.targetId,h);i.push(g)}}))}),await Promise.all(a),n.Ca.d_(s),await async function(c,h){const f=k(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",g=>w.forEach(h,_=>w.forEach(_.$i,b=>f.persistence.referenceDelegate.addReference(g,_.targetId,b)).next(()=>w.forEach(_.Ui,b=>f.persistence.referenceDelegate.removeReference(g,_.targetId,b)))))}catch(g){if(!Ct(g))throw g;x("LocalStore","Failed to update sequence numbers: "+g)}for(const g of h){const _=g.targetId;if(!g.fromCache){const b=f.os.get(_),C=b.snapshotVersion,N=b.withLastLimboFreeSnapshotVersion(C);f.os=f.os.insert(_,N)}}}(n.localStore,i))}async function L_(r,e){const t=k(r);if(!t.currentUser.isEqual(e)){x("SyncEngine","User change. New user:",e.toKey());const n=await qh(t.localStore,e);t.currentUser=e,function(i,a){i.ka.forEach(u=>{u.forEach(c=>{c.reject(new D(P.CANCELLED,a))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await ot(t,n.hs)}}function B_(r,e){const t=k(r),n=t.Na.get(e);if(n&&n.va)return G().add(n.key);{let s=G();const i=t.Ma.get(e);if(!i)return s;for(const a of i){const u=t.Fa.get(a);s=s.unionWith(u.view.Va)}return s}}async function U_(r,e){const t=k(r),n=await Js(t.localStore,e.query,!0),s=e.view.ba(n);return t.isPrimaryClient&&Vo(t,e.targetId,s.wa),s}async function q_(r,e){const t=k(r);return Kh(t.localStore,e).then(n=>ot(t,n))}async function j_(r,e,t,n){const s=k(r),i=await function(u,c){const h=k(u),f=k(h.mutationQueue);return h.persistence.runTransaction("Lookup mutation documents","readonly",g=>f.Mn(g,c).next(_=>_?h.localDocuments.getDocuments(g,_):w.resolve(null)))}(s.localStore,e);i!==null?(t==="pending"?await Kn(s.remoteStore):t==="acknowledged"||t==="rejected"?(ma(s,e,n||null),fa(s,e),function(u,c){k(k(u).mutationQueue).On(c)}(s.localStore,e)):F(),await ot(s,i)):x("SyncEngine","Cannot apply mutation batch with id: "+e)}async function z_(r,e){const t=k(r);if(fi(t),pa(t),e===!0&&t.Qa!==!0){const n=t.sharedClientState.getAllActiveQueryTargets(),s=await Gc(t,n.toArray());t.Qa=!0,await Po(t.remoteStore,!0);for(const i of s)di(t.remoteStore,i)}else if(e===!1&&t.Qa!==!1){const n=[];let s=Promise.resolve();t.Ma.forEach((i,a)=>{t.sharedClientState.isLocalQueryTarget(a)?n.push(a):s=s.then(()=>(On(t,a),Nn(t.localStore,a,!0))),kn(t.remoteStore,a)}),await s,await Gc(t,n),function(a){const u=k(a);u.Na.forEach((c,h)=>{kn(u.remoteStore,h)}),u.La.pr(),u.Na=new Map,u.Oa=new se(O.comparator)}(t),t.Qa=!1,await Po(t.remoteStore,!1)}}async function Gc(r,e,t){const n=k(r),s=[],i=[];for(const a of e){let u;const c=n.Ma.get(a);if(c&&c.length!==0){u=await xn(n.localStore,ke(c[0]));for(const h of c){const f=n.Fa.get(h),g=await U_(n,f);g.snapshot&&i.push(g.snapshot)}}else{const h=await Gh(n.localStore,a);u=await xn(n.localStore,h),await da(n,ud(h),a,!1,u.resumeToken)}s.push(u)}return n.Ca.d_(i),s}function ud(r){return $l(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function G_(r){return function(t){return k(k(t).persistence).Qi()}(k(r).localStore)}async function K_(r,e,t,n){const s=k(r);if(s.Qa)return void x("SyncEngine","Ignoring unexpected query state notification.");const i=s.Ma.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{const a=await Kh(s.localStore,Jl(i[0])),u=Wr.createSynthesizedRemoteEventForCurrentChange(e,t==="current",de.EMPTY_BYTE_STRING);await ot(s,a,u);break}case"rejected":await Nn(s.localStore,e,!0),On(s,e,n);break;default:F()}}async function $_(r,e,t){const n=fi(r);if(n.Qa){for(const s of e){if(n.Ma.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){x("SyncEngine","Adding an already active target "+s);continue}const i=await Gh(n.localStore,s),a=await xn(n.localStore,i);await da(n,ud(i),a.targetId,!1,a.resumeToken),di(n.remoteStore,a)}for(const s of t)n.Ma.has(s)&&await Nn(n.localStore,s,!1).then(()=>{kn(n.remoteStore,s),On(n,s)}).catch(Vt)}}function fi(r){const e=k(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=od.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=B_.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=N_.bind(null,e),e.Ca.d_=T_.bind(null,e.eventManager),e.Ca.$a=v_.bind(null,e.eventManager),e}function pa(r){const e=k(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=k_.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=M_.bind(null,e),e}function Q_(r,e,t){const n=k(r);(async function(i,a,u){try{const c=await a.getMetadata();if(await function(b,C){const N=k(b),V=pe(C.createTime);return N.persistence.runTransaction("hasNewerBundle","readonly",q=>N.Gr.getBundleMetadata(q,C.id)).then(q=>!!q&&q.createTime.compareTo(V)>=0)}(i.localStore,c))return await a.close(),u._completeWith(function(b){return{taskState:"Success",documentsLoaded:b.totalDocuments,bytesLoaded:b.totalBytes,totalDocuments:b.totalDocuments,totalBytes:b.totalBytes}}(c)),Promise.resolve(new Set);u._updateProgress(td(c));const h=new A_(c,i.localStore,a.serializer);let f=await a.Ua();for(;f;){const _=await h.la(f);_&&u._updateProgress(_),f=await a.Ua()}const g=await h.complete();return await ot(i,g.Ia,void 0),await function(b,C){const N=k(b);return N.persistence.runTransaction("Save bundle","readwrite",V=>N.Gr.saveBundleMetadata(V,C))}(i.localStore,c),u._completeWith(g.progress),Promise.resolve(g.Pa)}catch(c){return qe("SyncEngine",`Loading bundle failed with ${c}`),u._failWith(c),Promise.resolve(new Set)}})(n,e,t).then(s=>{n.sharedClientState.notifyBundleLoaded(s)})}class Rt{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Jr(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return Uh(this.persistence,new Bh,e.initialUser,this.serializer)}Ga(e){return new Xo(hi.Zr,this.serializer)}Wa(e){return new Qh}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Rt.provider={build:()=>new Rt};class W_ extends Rt{constructor(e){super(),this.cacheSizeBytes=e}ja(e,t){L(this.persistence.referenceDelegate instanceof Hs);const n=this.persistence.referenceDelegate.garbageCollector;return new kh(n,e.asyncQueue,t)}Ga(e){const t=this.cacheSizeBytes!==void 0?xe.withCacheSize(this.cacheSizeBytes):xe.DEFAULT;return new Xo(n=>Hs.Zr(n,t),this.serializer)}}class _a extends Rt{constructor(e,t,n){super(),this.Ja=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Ja.initialize(this,e),await pa(this.Ja.syncEngine),await Kn(this.Ja.remoteStore),await this.persistence.yi(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}za(e){return Uh(this.persistence,new Bh,e.initialUser,this.serializer)}ja(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new kh(n,e.asyncQueue,t)}Ha(e,t){const n=new gg(t,this.persistence);return new mg(e.asyncQueue,n)}Ga(e){const t=ea(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?xe.withCacheSize(this.cacheSizeBytes):xe.DEFAULT;return new Zo(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,Wh(),Fs(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Wa(e){return new Qh}}class cd extends _a{constructor(e,t){super(e,t,!1),this.Ja=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Ja.syncEngine;this.sharedClientState instanceof no&&(this.sharedClientState.syncEngine={no:j_.bind(null,t),ro:K_.bind(null,t),io:$_.bind(null,t),Qi:G_.bind(null,t),eo:q_.bind(null,t)},await this.sharedClientState.start()),await this.persistence.yi(async n=>{await z_(this.Ja.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())})}Wa(e){const t=Wh();if(!no.D(t))throw new D(P.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=ea(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new no(t,e.asyncQueue,n,e.clientId,e.initialUser)}}class Pt{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>zc(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=L_.bind(null,this.syncEngine),await Po(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new E_}()}createDatastore(e){const t=Jr(e.databaseInfo.databaseId),n=function(i){return new r_(i)}(e.databaseInfo);return function(i,a,u,c){return new o_(i,a,u,c)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return function(n,s,i,a,u){return new u_(n,s,i,a,u)}(this.localStore,this.datastore,e.asyncQueue,t=>zc(this.syncEngine,t,0),function(){return Fc.D()?new Fc:new e_}())}createSyncEngine(e,t){return function(s,i,a,u,c,h,f){const g=new P_(s,i,a,u,c,h);return f&&(g.Qa=!0),g}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=k(s);x("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Gn(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}Pt.provider={build:()=>new Pt};function Kc(r,e=10240){let t=0;return{async read(){if(t<r.byteLength){const n={value:r.slice(t,t+e),done:!1};return t+=e,n}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mi{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):ge("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H_{constructor(e,t){this.Xa=e,this.serializer=t,this.metadata=new Te,this.buffer=new Uint8Array,this.eu=function(){return new TextDecoder("utf-8")}(),this.tu().then(n=>{n&&n.ua()?this.metadata.resolve(n.aa.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(n==null?void 0:n.aa)}`))},n=>this.metadata.reject(n))}close(){return this.Xa.cancel()}async getMetadata(){return this.metadata.promise}async Ua(){return await this.getMetadata(),this.tu()}async tu(){const e=await this.nu();if(e===null)return null;const t=this.eu.decode(e),n=Number(t);isNaN(n)&&this.ru(`length string (${t}) is not valid number`);const s=await this.iu(n);return new w_(JSON.parse(s),e.length+n)}su(){return this.buffer.findIndex(e=>e===123)}async nu(){for(;this.su()<0&&!await this.ou(););if(this.buffer.length===0)return null;const e=this.su();e<0&&this.ru("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async iu(e){for(;this.buffer.length<e;)await this.ou()&&this.ru("Reached the end of bundle when more is expected.");const t=this.eu.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}ru(e){throw this.Xa.cancel(),new Error(`Invalid bundle format: ${e}`)}async ou(){const e=await this.Xa.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J_{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new D(P.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await async function(s,i){const a=k(s),u={documents:i.map(g=>Br(a.serializer,g))},c=await a.Lo("BatchGetDocuments",a.serializer.databaseId,W.emptyPath(),u,i.length),h=new Map;c.forEach(g=>{const _=fp(a.serializer,g);h.set(_.key.toString(),_)});const f=[];return i.forEach(g=>{const _=h.get(g.toString());L(!!_),f.push(_)}),f}(this.datastore,e);return t.forEach(n=>this.recordVersion(n)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(e.toString())}delete(e){this.write(new zn(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,n)=>{const s=O.fromPath(n);this.mutations.push(new jo(s,this.precondition(s)))}),await async function(n,s){const i=k(n),a={writes:s.map(u=>Ur(i.serializer,u))};await i.Mo("Commit",i.serializer.databaseId,W.emptyPath(),a)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw F();t=U.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new D(P.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(U.min())?ce.exists(!1):ce.updateTime(t):ce.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(U.min()))throw new D(P.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return ce.updateTime(t)}return ce.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y_{constructor(e,t,n,s,i){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=s,this.deferred=i,this._u=n.maxAttempts,this.t_=new ra(this.asyncQueue,"transaction_retry")}au(){this._u-=1,this.uu()}uu(){this.t_.Go(async()=>{const e=new J_(this.datastore),t=this.cu(e);t&&t.then(n=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(n)}).catch(s=>{this.lu(s)}))}).catch(n=>{this.lu(n)})})}cu(e){try{const t=this.updateFunction(e);return!zr(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}lu(e){this._u>0&&this.hu(e)?(this._u-=1,this.asyncQueue.enqueueAndForget(()=>(this.uu(),Promise.resolve()))):this.deferred.reject(e)}hu(e){if(e.name==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!lh(t)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X_{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=s,this.user=Ee.UNAUTHENTICATED,this.clientId=ko.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,async a=>{x("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(n,a=>(x("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Te;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Qn(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function so(r,e){r.asyncQueue.verifyOperationInProgress(),x("FirestoreClient","Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener(async s=>{n.isEqual(s)||(await qh(e.localStore,s),n=s)}),e.persistence.setDatabaseDeletedListener(()=>r.terminate()),r._offlineComponents=e}async function $c(r,e){r.asyncQueue.verifyOperationInProgress();const t=await ya(r);x("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener(n=>Lc(e.remoteStore,n)),r.setAppCheckTokenChangeListener((n,s)=>Lc(e.remoteStore,s)),r._onlineComponents=e}async function ya(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){x("FirestoreClient","Using user provided OfflineComponentProvider");try{await so(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===P.FAILED_PRECONDITION||s.code===P.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;qe("Error using user provided cache. Falling back to memory cache: "+t),await so(r,new Rt)}}else x("FirestoreClient","Using default OfflineComponentProvider"),await so(r,new Rt);return r._offlineComponents}async function gi(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(x("FirestoreClient","Using user provided OnlineComponentProvider"),await $c(r,r._uninitializedComponentsProvider._online)):(x("FirestoreClient","Using default OnlineComponentProvider"),await $c(r,new Pt))),r._onlineComponents}function ld(r){return ya(r).then(e=>e.persistence)}function Wn(r){return ya(r).then(e=>e.localStore)}function hd(r){return gi(r).then(e=>e.remoteStore)}function Ia(r){return gi(r).then(e=>e.syncEngine)}function dd(r){return gi(r).then(e=>e.datastore)}async function Fn(r){const e=await gi(r),t=e.eventManager;return t.onListen=S_.bind(null,e.syncEngine),t.onUnlisten=C_.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=V_.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=D_.bind(null,e.syncEngine),t}function Z_(r){return r.asyncQueue.enqueue(async()=>{const e=await ld(r),t=await hd(r);return e.setNetworkEnabled(!0),function(s){const i=k(s);return i.L_.delete(0),Yr(i)}(t)})}function ey(r){return r.asyncQueue.enqueue(async()=>{const e=await ld(r),t=await hd(r);return e.setNetworkEnabled(!1),async function(s){const i=k(s);i.L_.add(0),await Gn(i),i.q_.set("Offline")}(t)})}function ty(r,e){const t=new Te;return r.asyncQueue.enqueueAndForget(async()=>async function(s,i,a){try{const u=await function(h,f){const g=k(h);return g.persistence.runTransaction("read document","readonly",_=>g.localDocuments.getDocument(_,f))}(s,i);u.isFoundDocument()?a.resolve(u):u.isNoDocument()?a.resolve(null):a.reject(new D(P.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(u){const c=Qn(u,`Failed to get document '${i} from cache`);a.reject(c)}}(await Wn(r),e,t)),t.promise}function fd(r,e,t={}){const n=new Te;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,c,h){const f=new mi({next:_=>{f.Za(),a.enqueueAndForget(()=>ca(i,g));const b=_.docs.has(u);!b&&_.fromCache?h.reject(new D(P.UNAVAILABLE,"Failed to get document because the client is offline.")):b&&_.fromCache&&c&&c.source==="server"?h.reject(new D(P.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(_)},error:_=>h.reject(_)}),g=new ha(qn(u.path),f,{includeMetadataChanges:!0,_a:!0});return ua(i,g)}(await Fn(r),r.asyncQueue,e,t,n)),n.promise}function ny(r,e){const t=new Te;return r.asyncQueue.enqueueAndForget(async()=>async function(s,i,a){try{const u=await Js(s,i,!0),c=new sd(i,u.Ts),h=c.ma(u.documents),f=c.applyChanges(h,!1);a.resolve(f.snapshot)}catch(u){const c=Qn(u,`Failed to execute query '${i} against cache`);a.reject(c)}}(await Wn(r),e,t)),t.promise}function md(r,e,t={}){const n=new Te;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,c,h){const f=new mi({next:_=>{f.Za(),a.enqueueAndForget(()=>ca(i,g)),_.fromCache&&c.source==="server"?h.reject(new D(P.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(_)},error:_=>h.reject(_)}),g=new ha(u,f,{includeMetadataChanges:!0,_a:!0});return ua(i,g)}(await Fn(r),r.asyncQueue,e,t,n)),n.promise}function ry(r,e,t){const n=new Te;return r.asyncQueue.enqueueAndForget(async()=>{try{const s=await dd(r);n.resolve(async function(a,u,c){var h;const f=k(a),{request:g,ut:_,parent:b}=vh(f.serializer,Ql(u),c);f.connection.Fo||delete g.parent;const C=(await f.Lo("RunAggregationQuery",f.serializer.databaseId,b,g,1)).filter(V=>!!V.result);L(C.length===1);const N=(h=C[0].result)===null||h===void 0?void 0:h.aggregateFields;return Object.keys(N).reduce((V,q)=>(V[_[q]]=N[q],V),{})}(s,e,t))}catch(s){n.reject(s)}}),n.promise}function sy(r,e){const t=new mi(e);return r.asyncQueue.enqueueAndForget(async()=>function(s,i){k(s).Y_.add(i),i.next()}(await Fn(r),t)),()=>{t.Za(),r.asyncQueue.enqueueAndForget(async()=>function(s,i){k(s).Y_.delete(i)}(await Fn(r),t))}}function iy(r,e,t,n){const s=function(a,u){let c;return c=typeof a=="string"?dh().encode(a):a,function(f,g){return new H_(f,g)}(function(f,g){if(f instanceof Uint8Array)return Kc(f,g);if(f instanceof ArrayBuffer)return Kc(new Uint8Array(f),g);if(f instanceof ReadableStream)return f.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")}(c),u)}(t,Jr(e));r.asyncQueue.enqueueAndForget(async()=>{Q_(await Ia(r),s,n)})}function oy(r,e){return r.asyncQueue.enqueue(async()=>function(n,s){const i=k(n);return i.persistence.runTransaction("Get named query","readonly",a=>i.Gr.getNamedQuery(a,s))}(await Wn(r),e))}function ay(r,e){return r.asyncQueue.enqueue(async()=>async function(n,s){const i=k(n),a=i.indexManager,u=[];return i.persistence.runTransaction("Configure indexes","readwrite",c=>a.getFieldIndexes(c).next(h=>function(g,_,b,C,N){g=[...g],_=[..._],g.sort(b),_.sort(b);const V=g.length,q=_.length;let j=0,B=0;for(;j<q&&B<V;){const $=b(g[B],_[j]);$<0?N(g[B++]):$>0?C(_[j++]):(j++,B++)}for(;j<q;)C(_[j++]);for(;B<V;)N(g[B++])}(h,s,lg,f=>{u.push(a.addFieldIndex(c,f))},f=>{u.push(a.deleteFieldIndex(c,f))})).next(()=>w.waitFor(u)))}(await Wn(r),e))}function uy(r,e){return r.asyncQueue.enqueue(async()=>function(n,s){k(n).ss.zi=s}(await Wn(r),e))}function cy(r){return r.asyncQueue.enqueue(async()=>function(t){const n=k(t),s=n.indexManager;return n.persistence.runTransaction("Delete All Indexes","readwrite",i=>s.deleteAllFieldIndexes(i))}(await Wn(r)))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gd(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qc=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ea(r,e,t){if(!t)throw new D(P.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function pd(r,e,t,n){if(e===!0&&n===!0)throw new D(P.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function Wc(r){if(!O.isDocumentKey(r))throw new D(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function Hc(r){if(O.isDocumentKey(r))throw new D(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function pi(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=function(n){return n.constructor?n.constructor.name:null}(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":F()}function Q(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new D(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=pi(r);throw new D(P.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}function _d(r,e){if(e<=0)throw new D(P.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jc{constructor(e){var t,n;if(e.host===void 0){if(e.ssl!==void 0)throw new D(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new D(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}pd("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=gd((n=e.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new D(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new D(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new D(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(n,s){return n.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Xr{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Jc({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new D(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Jc(e),e.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new El;switch(n.type){case"firstParty":return new ig(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new D(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const n=Qc.get(t);n&&(x("ComponentProvider","Removing Datastore"),Qc.delete(t),n.terminate())}(this),Promise.resolve()}}function yd(r,e,t,n={}){var s;const i=(r=Q(r,Xr))._getSettings(),a=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&qe("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),r._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),n.mockUserToken){let u,c;if(typeof n.mockUserToken=="string")u=n.mockUserToken,c=Ee.MOCK_USER;else{u=Mf(n.mockUserToken,(s=r._app)===null||s===void 0?void 0:s.options.projectId);const h=n.mockUserToken.sub||n.mockUserToken.user_id;if(!h)throw new D(P.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new Ee(h)}r._authCredentials=new ng(new Il(u,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new we(this.firestore,e,this._query)}}class me{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ge(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new me(this.firestore,e,this._key)}}class Ge extends we{constructor(e,t,n){super(e,t,qn(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new me(this.firestore,null,new O(e))}withConverter(e){return new Ge(this.firestore,e,this._path)}}function ly(r,e,...t){if(r=ve(r),Ea("collection","path",e),r instanceof Xr){const n=W.fromString(e,...t);return Hc(n),new Ge(r,null,n)}{if(!(r instanceof me||r instanceof Ge))throw new D(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(W.fromString(e,...t));return Hc(n),new Ge(r.firestore,null,n)}}function hy(r,e){if(r=Q(r,Xr),Ea("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new D(P.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new we(r,null,function(n){return new rt(W.emptyPath(),n)}(e))}function Id(r,e,...t){if(r=ve(r),arguments.length===1&&(e=ko.newId()),Ea("doc","path",e),r instanceof Xr){const n=W.fromString(e,...t);return Wc(n),new me(r,null,new O(n))}{if(!(r instanceof me||r instanceof Ge))throw new D(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(W.fromString(e,...t));return Wc(n),new me(r.firestore,r instanceof Ge?r.converter:null,new O(n))}}function dy(r,e){return r=ve(r),e=ve(e),(r instanceof me||r instanceof Ge)&&(e instanceof me||e instanceof Ge)&&r.firestore===e.firestore&&r.path===e.path&&r.converter===e.converter}function Ta(r,e){return r=ve(r),e=ve(e),r instanceof we&&e instanceof we&&r.firestore===e.firestore&&Kr(r._query,e._query)&&r.converter===e.converter}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yc{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new ra(this,"async_queue_retry"),this.Vu=()=>{const n=Fs();n&&x("AsyncQueue","Visibility state changed to "+n.visibilityState),this.t_.jo()},this.mu=e;const t=Fs();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Fs();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Te;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Ct(e))throw e;x("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(n=>{this.Eu=n,this.du=!1;const s=function(a){let u=a.message||"";return a.stack&&(u=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),u}(n);throw ge("INTERNAL UNHANDLED ERROR: ",s),n}).then(n=>(this.du=!1,n))));return this.mu=t,t}enqueueAfterDelay(e,t,n){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=aa.createAndSchedule(this,e,t,n,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&F()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,n)=>t.targetTimeMs-n.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}function Co(r){return function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1}(r,["next","error","complete"])}class Ed{constructor(){this._progressObserver={},this._taskCompletionResolver=new Te,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,n){this._progressObserver={next:e,error:t,complete:n}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fy=-1;class ne extends Xr{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new Yc,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Yc(e),this._firestoreClient=void 0,await e}}}function my(r,e,t){t||(t="(default)");const n=xo(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(Ht(i,e))return s;throw new D(P.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new D(P.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new D(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return n.initialize({options:e,instanceIdentifier:t})}function gy(r,e){const t=typeof r=="object"?r:Gm(),n=typeof r=="string"?r:e||"(default)",s=xo(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=Nf("firestore");i&&yd(s,...i)}return s}function he(r){if(r._terminated)throw new D(P.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||Td(r),r._firestoreClient}function Td(r){var e,t,n;const s=r._freezeSettings(),i=function(u,c,h,f){return new Fg(u,c,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,gd(f.experimentalLongPollingOptions),f.useFetchStreams)}(r._databaseId,((e=r._app)===null||e===void 0?void 0:e.options.appId)||"",r._persistenceKey,s);r._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((n=s.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(r._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),r._firestoreClient=new X_(r._authCredentials,r._appCheckCredentials,r._queue,i,r._componentsProvider&&function(u){const c=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(c),_online:c}}(r._componentsProvider))}function py(r,e){qe("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=r._freezeSettings();return vd(r,Pt.provider,{build:n=>new _a(n,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}async function _y(r){qe("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const e=r._freezeSettings();vd(r,Pt.provider,{build:t=>new cd(t,e.cacheSizeBytes)})}function vd(r,e,t){if((r=Q(r,ne))._firestoreClient||r._terminated)throw new D(P.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(r._componentsProvider||r._getSettings().localCache)throw new D(P.FAILED_PRECONDITION,"SDK cache is already specified.");r._componentsProvider={_online:e,_offline:t},Td(r)}function yy(r){if(r._initialized&&!r._terminated)throw new D(P.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new Te;return r._queue.enqueueAndForgetEvenWhileRestricted(async()=>{try{await async function(n){if(!Qe.D())return Promise.resolve();const s=n+"main";await Qe.delete(s)}(ea(r._databaseId,r._persistenceKey)),e.resolve()}catch(t){e.reject(t)}}),e.promise}function Iy(r){return function(t){const n=new Te;return t.asyncQueue.enqueueAndForget(async()=>O_(await Ia(t),n)),n.promise}(he(r=Q(r,ne)))}function Ey(r){return Z_(he(r=Q(r,ne)))}function Ty(r){return ey(he(r=Q(r,ne)))}function vy(r){return Bm(r.app,"firestore",r._databaseId.database),r._delete()}function wy(r,e){const t=he(r=Q(r,ne)),n=new Ed;return iy(t,r._databaseId,e,n),n}function Ay(r,e){return oy(he(r=Q(r,ne)),e).then(t=>t?new we(r,null,t.query):null)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ln{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class wd{constructor(e,t,n){this._userDataWriter=t,this._data=n,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St{constructor(e){this._byteString=e}static fromBase64String(e){try{return new St(de.fromBase64String(e))}catch(t){throw new D(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new St(de.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new D(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ae(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function by(){return new Nt("__name__")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _i{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new D(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new D(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return z(this._lat,e._lat)||z(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zr{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ry=/^__.*__$/;class Py{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new it(e,this.data,this.fieldMask,t,this.fieldTransforms):new jn(e,this.data,t,this.fieldTransforms)}}class Ad{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new it(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function bd(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw F()}}class yi{constructor(e,t,n,s,i,a){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new yi(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:n,xu:!1});return s.Ou(e),s}Nu(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:n,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return ei(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(bd(this.Cu)&&Ry.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Sy{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Jr(e)}Qu(e,t,n,s=!1){return new yi({Cu:e,methodName:t,qu:n,path:ae.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function on(r){const e=r._freezeSettings(),t=Jr(r._databaseId);return new Sy(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Ii(r,e,t,n,s,i={}){const a=r.Qu(i.merge||i.mergeFields?2:0,e,t,s);Sa("Data must be an object, but it was:",a,n);const u=Sd(n,a);let c,h;if(i.merge)c=new Le(a.fieldMask),h=a.fieldTransforms;else if(i.mergeFields){const f=[];for(const g of i.mergeFields){const _=qr(e,g,t);if(!a.contains(_))throw new D(P.INVALID_ARGUMENT,`Field '${_}' is specified in your field mask but missing from your input data.`);Cd(f,_)||f.push(_)}c=new Le(f),h=a.fieldTransforms.filter(g=>c.covers(g.field))}else c=null,h=a.fieldTransforms;return new Py(new Re(u),c,h)}class es extends kt{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof es}}function Rd(r,e,t){return new yi({Cu:3,qu:e.settings.qu,methodName:r._methodName,xu:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class va extends kt{_toFieldTransform(e){return new Qr(e.path,new Vn)}isEqual(e){return e instanceof va}}class wa extends kt{constructor(e,t){super(e),this.Ku=t}_toFieldTransform(e){const t=Rd(this,e,!0),n=this.Ku.map(i=>an(i,t)),s=new Xt(n);return new Qr(e.path,s)}isEqual(e){return e instanceof wa&&Ht(this.Ku,e.Ku)}}class Aa extends kt{constructor(e,t){super(e),this.Ku=t}_toFieldTransform(e){const t=Rd(this,e,!0),n=this.Ku.map(i=>an(i,t)),s=new Zt(n);return new Qr(e.path,s)}isEqual(e){return e instanceof Aa&&Ht(this.Ku,e.Ku)}}class ba extends kt{constructor(e,t){super(e),this.$u=t}_toFieldTransform(e){const t=new Cn(e.serializer,nh(e.serializer,this.$u));return new Qr(e.path,t)}isEqual(e){return e instanceof ba&&this.$u===e.$u}}function Ra(r,e,t,n){const s=r.Qu(1,e,t);Sa("Data must be an object, but it was:",s,n);const i=[],a=Re.empty();Dt(n,(c,h)=>{const f=Ei(e,c,t);h=ve(h);const g=s.Nu(f);if(h instanceof es)i.push(f);else{const _=an(h,g);_!=null&&(i.push(f),a.set(f,_))}});const u=new Le(i);return new Ad(a,u,s.fieldTransforms)}function Pa(r,e,t,n,s,i){const a=r.Qu(1,e,t),u=[qr(e,n,t)],c=[s];if(i.length%2!=0)throw new D(P.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let _=0;_<i.length;_+=2)u.push(qr(e,i[_])),c.push(i[_+1]);const h=[],f=Re.empty();for(let _=u.length-1;_>=0;--_)if(!Cd(h,u[_])){const b=u[_];let C=c[_];C=ve(C);const N=a.Nu(b);if(C instanceof es)h.push(b);else{const V=an(C,N);V!=null&&(h.push(b),f.set(b,V))}}const g=new Le(h);return new Ad(f,g,a.fieldTransforms)}function Pd(r,e,t,n=!1){return an(t,r.Qu(n?4:3,e))}function an(r,e){if(Vd(r=ve(r)))return Sa("Unsupported field value:",e,r),Sd(r,e);if(r instanceof kt)return function(n,s){if(!bd(s.Cu))throw s.Bu(`${n._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${n._methodName}() is not currently supported inside arrays`);const i=n._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(n,s){const i=[];let a=0;for(const u of n){let c=an(u,s.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),a++}return{arrayValue:{values:i}}}(r,e)}return function(n,s){if((n=ve(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return nh(s.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const i=le.fromDate(n);return{timestampValue:Dn(s.serializer,i)}}if(n instanceof le){const i=new le(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:Dn(s.serializer,i)}}if(n instanceof _i)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof St)return{bytesValue:gh(s.serializer,n._byteString)};if(n instanceof me){const i=s.databaseId,a=n.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Qo(n.firestore._databaseId||s.databaseId,n._key.path)}}if(n instanceof Zr)return function(a,u){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw u.Bu("VectorValues must only contain numeric values.");return qo(u.serializer,c)})}}}}}}(n,s);throw s.Bu(`Unsupported field value: ${pi(n)}`)}(r,e)}function Sd(r,e){const t={};return kl(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Dt(r,(n,s)=>{const i=an(s,e.Mu(n));i!=null&&(t[n]=i)}),{mapValue:{fields:t}}}function Vd(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof le||r instanceof _i||r instanceof St||r instanceof me||r instanceof kt||r instanceof Zr)}function Sa(r,e,t){if(!Vd(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const n=pi(t);throw n==="an object"?e.Bu(r+" a custom object"):e.Bu(r+" "+n)}}function qr(r,e,t){if((e=ve(e))instanceof Nt)return e._internalPath;if(typeof e=="string")return Ei(r,e);throw ei("Field path arguments must be of type string or ",r,!1,void 0,t)}const Vy=new RegExp("[~\\*/\\[\\]]");function Ei(r,e,t){if(e.search(Vy)>=0)throw ei(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new Nt(...e.split("."))._internalPath}catch{throw ei(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function ei(r,e,t,n,s){const i=n&&!n.isEmpty(),a=s!==void 0;let u=`Function ${e}() called with invalid data`;t&&(u+=" (via `toFirestore()`)"),u+=". ";let c="";return(i||a)&&(c+=" (found",i&&(c+=` in field ${n}`),a&&(c+=` in document ${s}`),c+=")"),new D(P.INVALID_ARGUMENT,u+r+c)}function Cd(r,e){return r.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jr{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new me(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Cy(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Ti("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Cy extends jr{data(){return super.data()}}function Ti(r,e){return typeof e=="string"?Ei(r,e):e instanceof Nt?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dd(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new D(P.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Va{}class Hn extends Va{}function Dy(r,e,...t){let n=[];e instanceof Va&&n.push(e),n=n.concat(t),function(i){const a=i.filter(c=>c instanceof un).length,u=i.filter(c=>c instanceof Jn).length;if(a>1||a>0&&u>0)throw new D(P.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const s of n)r=s._apply(r);return r}class Jn extends Hn{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Jn(e,t,n)}_apply(e){const t=this._parse(e);return Nd(e._query,t),new we(e.firestore,e.converter,yo(e._query,t))}_parse(e){const t=on(e.firestore);return function(i,a,u,c,h,f,g){let _;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new D(P.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Zc(g,f);const b=[];for(const C of g)b.push(Xc(c,i,C));_={arrayValue:{values:b}}}else _=Xc(c,i,g)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Zc(g,f),_=Pd(u,a,g,f==="in"||f==="not-in");return H.create(h,f,_)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function xy(r,e,t){const n=e,s=Ti("where",r);return Jn._create(s,n,t)}class un extends Va{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new un(e,t)}_parse(e){const t=this._queryConstraints.map(n=>n._parse(e)).filter(n=>n.getFilters().length>0);return t.length===1?t[0]:ee.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let a=s;const u=i.getFlattenedFilters();for(const c of u)Nd(a,c),a=yo(a,c)}(e._query,t),new we(e.firestore,e.converter,yo(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function Ny(...r){return r.forEach(e=>kd("or",e)),un._create("or",r)}function ky(...r){return r.forEach(e=>kd("and",e)),un._create("and",r)}class vi extends Hn{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new vi(e,t)}_apply(e){const t=function(s,i,a){if(s.startAt!==null)throw new D(P.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new D(P.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Lr(i,a)}(e._query,this._field,this._direction);return new we(e.firestore,e.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new rt(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function My(r,e="asc"){const t=e,n=Ti("orderBy",r);return vi._create(n,t)}class ts extends Hn{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new ts(e,t,n)}_apply(e){return new we(e.firestore,e.converter,Gs(e._query,this._limit,this._limitType))}}function Oy(r){return _d("limit",r),ts._create("limit",r,"F")}function Fy(r){return _d("limitToLast",r),ts._create("limitToLast",r,"L")}class ns extends Hn{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new ns(e,t,n)}_apply(e){const t=xd(e,this.type,this._docOrFields,this._inclusive);return new we(e.firestore,e.converter,function(s,i){return new rt(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,i,s.endAt)}(e._query,t))}}function Ly(...r){return ns._create("startAt",r,!0)}function By(...r){return ns._create("startAfter",r,!1)}class rs extends Hn{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new rs(e,t,n)}_apply(e){const t=xd(e,this.type,this._docOrFields,this._inclusive);return new we(e.firestore,e.converter,function(s,i){return new rt(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,s.startAt,i)}(e._query,t))}}function Uy(...r){return rs._create("endBefore",r,!1)}function qy(...r){return rs._create("endAt",r,!0)}function xd(r,e,t,n){if(t[0]=ve(t[0]),t[0]instanceof jr)return function(i,a,u,c,h){if(!c)throw new D(P.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);const f=[];for(const g of Tn(i))if(g.field.isKeyField())f.push(Jt(a,c.key));else{const _=c.data.field(g.field);if(ri(_))throw new D(P.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+g.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(_===null){const b=g.field.canonicalString();throw new D(P.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${b}' (used as the orderBy) does not exist.`)}f.push(_)}return new At(f,h)}(r._query,r.firestore._databaseId,e,t[0]._document,n);{const s=on(r.firestore);return function(a,u,c,h,f,g){const _=a.explicitOrderBy;if(f.length>_.length)throw new D(P.INVALID_ARGUMENT,`Too many arguments provided to ${h}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const b=[];for(let C=0;C<f.length;C++){const N=f[C];if(_[C].field.isKeyField()){if(typeof N!="string")throw new D(P.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${h}(), but got a ${typeof N}`);if(!Bo(a)&&N.indexOf("/")!==-1)throw new D(P.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${h}() must be a plain document ID, but '${N}' contains a slash.`);const V=a.path.child(W.fromString(N));if(!O.isDocumentKey(V))throw new D(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${h}() must result in a valid document path, but '${V}' is not because it contains an odd number of segments.`);const q=new O(V);b.push(Jt(u,q))}else{const V=Pd(c,h,N);b.push(V)}}return new At(b,g)}(r._query,r.firestore._databaseId,s,e,t,n)}}function Xc(r,e,t){if(typeof(t=ve(t))=="string"){if(t==="")throw new D(P.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Bo(e)&&t.indexOf("/")!==-1)throw new D(P.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(W.fromString(t));if(!O.isDocumentKey(n))throw new D(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Jt(r,new O(n))}if(t instanceof me)return Jt(r,t._key);throw new D(P.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${pi(t)}.`)}function Zc(r,e){if(!Array.isArray(r)||r.length===0)throw new D(P.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Nd(r,e){const t=function(s,i){for(const a of s)for(const u of a.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null}(r.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new D(P.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new D(P.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function kd(r,e){if(!(e instanceof Jn||e instanceof un))throw new D(P.INVALID_ARGUMENT,`Function ${r}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}class Ca{convertValue(e,t="none"){switch(vt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ue(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(nt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw F()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Dt(e,(s,i)=>{n[s]=this.convertValue(i,t)}),n}convertVectorValue(e){var t,n,s;const i=(s=(n=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.map(a=>ue(a.doubleValue));return new Zr(i)}convertGeoPoint(e){return new _i(ue(e.latitude),ue(e.longitude))}convertArray(e,t){return(e.values||[]).map(n=>this.convertValue(n,t))}convertServerTimestamp(e,t){switch(t){case"previous":const n=si(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(Mr(e));default:return null}}convertTimestamp(e){const t=tt(e);return new le(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=W.fromString(e);L(Rh(n));const s=new Tt(n.get(1),n.get(3)),i=new O(n.popFirst(5));return s.isEqual(t)||ge(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wi(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class jy extends Ca{constructor(e){super(),this.firestore=e}convertBytes(e){return new St(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new me(this.firestore,null,t)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zy(r){return new Ln("sum",qr("sum",r))}function Gy(r){return new Ln("avg",qr("average",r))}function Md(){return new Ln("count")}function Ky(r,e){var t,n;return r instanceof Ln&&e instanceof Ln&&r.aggregateType===e.aggregateType&&((t=r._internalFieldPath)===null||t===void 0?void 0:t.canonicalString())===((n=e._internalFieldPath)===null||n===void 0?void 0:n.canonicalString())}function $y(r,e){return Ta(r.query,e.query)&&Ht(r.data(),e.data())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class rn extends jr{constructor(e,t,n,s,i,a){super(e,t,n,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Cr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(Ti("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}}class Cr extends rn{data(e={}){return super.data(e)}}class sn{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new _t(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(n=>{e.call(t,new Cr(this._firestore,this._userDataWriter,n.key,n,new _t(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new D(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(u=>{const c=new Cr(s._firestore,s._userDataWriter,u.doc.key,u.doc,new _t(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(u=>i||u.type!==3).map(u=>{const c=new Cr(s._firestore,s._userDataWriter,u.doc.key,u.doc,new _t(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return u.type!==0&&(h=a.indexOf(u.doc.key),a=a.delete(u.doc.key)),u.type!==1&&(a=a.add(u.doc),f=a.indexOf(u.doc.key)),{type:Qy(u.type),doc:c,oldIndex:h,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function Qy(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return F()}}function Wy(r,e){return r instanceof rn&&e instanceof rn?r._firestore===e._firestore&&r._key.isEqual(e._key)&&(r._document===null?e._document===null:r._document.isEqual(e._document))&&r._converter===e._converter:r instanceof sn&&e instanceof sn&&r._firestore===e._firestore&&Ta(r.query,e.query)&&r.metadata.isEqual(e.metadata)&&r._snapshot.isEqual(e._snapshot)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hy(r){r=Q(r,me);const e=Q(r.firestore,ne);return fd(he(e),r._key).then(t=>Da(e,r,t))}class Mt extends Ca{constructor(e){super(),this.firestore=e}convertBytes(e){return new St(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new me(this.firestore,null,t)}}function Jy(r){r=Q(r,me);const e=Q(r.firestore,ne),t=he(e),n=new Mt(e);return ty(t,r._key).then(s=>new rn(e,n,r._key,s,new _t(s!==null&&s.hasLocalMutations,!0),r.converter))}function Yy(r){r=Q(r,me);const e=Q(r.firestore,ne);return fd(he(e),r._key,{source:"server"}).then(t=>Da(e,r,t))}function Xy(r){r=Q(r,we);const e=Q(r.firestore,ne),t=he(e),n=new Mt(e);return Dd(r._query),md(t,r._query).then(s=>new sn(e,n,r,s))}function Zy(r){r=Q(r,we);const e=Q(r.firestore,ne),t=he(e),n=new Mt(e);return ny(t,r._query).then(s=>new sn(e,n,r,s))}function eI(r){r=Q(r,we);const e=Q(r.firestore,ne),t=he(e),n=new Mt(e);return md(t,r._query,{source:"server"}).then(s=>new sn(e,n,r,s))}function tI(r,e,t){r=Q(r,me);const n=Q(r.firestore,ne),s=wi(r.converter,e,t);return Yn(n,[Ii(on(n),"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,ce.none())])}function nI(r,e,t,...n){r=Q(r,me);const s=Q(r.firestore,ne),i=on(s);let a;return a=typeof(e=ve(e))=="string"||e instanceof Nt?Pa(i,"updateDoc",r._key,e,t,n):Ra(i,"updateDoc",r._key,e),Yn(s,[a.toMutation(r._key,ce.exists(!0))])}function rI(r){return Yn(Q(r.firestore,ne),[new zn(r._key,ce.none())])}function sI(r,e){const t=Q(r.firestore,ne),n=Id(r),s=wi(r.converter,e);return Yn(t,[Ii(on(r.firestore),"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,ce.exists(!1))]).then(()=>n)}function iI(r,...e){var t,n,s;r=ve(r);let i={includeMetadataChanges:!1,source:"default"},a=0;typeof e[a]!="object"||Co(e[a])||(i=e[a],a++);const u={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(Co(e[a])){const g=e[a];e[a]=(t=g.next)===null||t===void 0?void 0:t.bind(g),e[a+1]=(n=g.error)===null||n===void 0?void 0:n.bind(g),e[a+2]=(s=g.complete)===null||s===void 0?void 0:s.bind(g)}let c,h,f;if(r instanceof me)h=Q(r.firestore,ne),f=qn(r._key.path),c={next:g=>{e[a]&&e[a](Da(h,r,g))},error:e[a+1],complete:e[a+2]};else{const g=Q(r,we);h=Q(g.firestore,ne),f=g._query;const _=new Mt(h);c={next:b=>{e[a]&&e[a](new sn(h,_,g,b))},error:e[a+1],complete:e[a+2]},Dd(r._query)}return function(_,b,C,N){const V=new mi(N),q=new ha(b,V,C);return _.asyncQueue.enqueueAndForget(async()=>ua(await Fn(_),q)),()=>{V.Za(),_.asyncQueue.enqueueAndForget(async()=>ca(await Fn(_),q))}}(he(h),f,u,c)}function oI(r,e){return sy(he(r=Q(r,ne)),Co(e)?e:{next:e})}function Yn(r,e){return function(n,s){const i=new Te;return n.asyncQueue.enqueueAndForget(async()=>x_(await Ia(n),s,i)),i.promise}(he(r),e)}function Da(r,e,t){const n=t.docs.get(e._key),s=new Mt(r);return new rn(r,s,e._key,n,new _t(t.hasPendingWrites,t.fromCache),e.converter)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aI(r){return Od(r,{count:Md()})}function Od(r,e){const t=Q(r.firestore,ne),n=he(t),s=Nl(e,(i,a)=>new ch(a,i.aggregateType,i._internalFieldPath));return ry(n,r._query,s).then(i=>function(u,c,h){const f=new Mt(u);return new wd(c,f,h)}(t,r,i))}class uI{constructor(e){this.kind="memory",this._onlineComponentProvider=Pt.provider,e!=null&&e.garbageCollector?this._offlineComponentProvider=e.garbageCollector._offlineComponentProvider:this._offlineComponentProvider=Rt.provider}toJSON(){return{kind:this.kind}}}class cI{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=Fd(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}class lI{constructor(){this.kind="memoryEager",this._offlineComponentProvider=Rt.provider}toJSON(){return{kind:this.kind}}}class hI{constructor(e){this.kind="memoryLru",this._offlineComponentProvider={build:()=>new W_(e)}}toJSON(){return{kind:this.kind}}}function dI(){return new lI}function fI(r){return new hI(r==null?void 0:r.cacheSizeBytes)}function mI(r){return new uI(r)}function gI(r){return new cI(r)}class pI{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Pt.provider,this._offlineComponentProvider={build:t=>new _a(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class _I{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Pt.provider,this._offlineComponentProvider={build:t=>new cd(t,e==null?void 0:e.cacheSizeBytes)}}}function Fd(r){return new pI(r==null?void 0:r.forceOwnership)}function yI(){return new _I}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const II={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ld{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=on(e)}set(e,t,n){this._verifyNotCommitted();const s=gt(e,this._firestore),i=wi(s.converter,t,n),a=Ii(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(a.toMutation(s._key,ce.none())),this}update(e,t,n,...s){this._verifyNotCommitted();const i=gt(e,this._firestore);let a;return a=typeof(t=ve(t))=="string"||t instanceof Nt?Pa(this._dataReader,"WriteBatch.update",i._key,t,n,s):Ra(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(a.toMutation(i._key,ce.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=gt(e,this._firestore);return this._mutations=this._mutations.concat(new zn(t._key,ce.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new D(P.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function gt(r,e){if((r=ve(r)).firestore!==e)throw new D(P.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bd extends class{constructor(t,n){this._firestore=t,this._transaction=n,this._dataReader=on(t)}get(t){const n=gt(t,this._firestore),s=new jy(this._firestore);return this._transaction.lookup([n._key]).then(i=>{if(!i||i.length!==1)return F();const a=i[0];if(a.isFoundDocument())return new jr(this._firestore,s,a.key,a,n.converter);if(a.isNoDocument())return new jr(this._firestore,s,n._key,null,n.converter);throw F()})}set(t,n,s){const i=gt(t,this._firestore),a=wi(i.converter,n,s),u=Ii(this._dataReader,"Transaction.set",i._key,a,i.converter!==null,s);return this._transaction.set(i._key,u),this}update(t,n,s,...i){const a=gt(t,this._firestore);let u;return u=typeof(n=ve(n))=="string"||n instanceof Nt?Pa(this._dataReader,"Transaction.update",a._key,n,s,i):Ra(this._dataReader,"Transaction.update",a._key,n),this._transaction.update(a._key,u),this}delete(t){const n=gt(t,this._firestore);return this._transaction.delete(n._key),this}}{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=gt(e,this._firestore),n=new Mt(this._firestore);return super.get(e).then(s=>new rn(this._firestore,n,t._key,s._document,new _t(!1,!1),t.converter))}}function EI(r,e,t){r=Q(r,ne);const n=Object.assign(Object.assign({},II),t);return function(i){if(i.maxAttempts<1)throw new D(P.INVALID_ARGUMENT,"Max attempts must be at least 1")}(n),function(i,a,u){const c=new Te;return i.asyncQueue.enqueueAndForget(async()=>{const h=await dd(i);new Y_(i.asyncQueue,h,u,a,c).au()}),c.promise}(he(r),s=>e(new Bd(r,s)),n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function TI(){return new es("deleteField")}function vI(){return new va("serverTimestamp")}function wI(...r){return new wa("arrayUnion",r)}function AI(...r){return new Aa("arrayRemove",r)}function bI(r){return new ba("increment",r)}function RI(r){return new Zr(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PI(r){return he(r=Q(r,ne)),new Ld(r,e=>Yn(r,e))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SI(r,e){const t=he(r=Q(r,ne));if(!t._uninitializedComponentsProvider||t._uninitializedComponentsProvider._offline.kind==="memory")return qe("Cannot enable indexes when persistence is disabled"),Promise.resolve();const n=function(i){const a=typeof i=="string"?function(h){try{return JSON.parse(h)}catch(f){throw new D(P.INVALID_ARGUMENT,"Failed to parse JSON: "+(f==null?void 0:f.message))}}(i):i,u=[];if(Array.isArray(a.indexes))for(const c of a.indexes){const h=el(c,"collectionGroup"),f=[];if(Array.isArray(c.fields))for(const g of c.fields){const _=Ei("setIndexConfiguration",el(g,"fieldPath"));g.arrayConfig==="CONTAINS"?f.push(new Wt(_,2)):g.order==="ASCENDING"?f.push(new Wt(_,0)):g.order==="DESCENDING"&&f.push(new Wt(_,1))}u.push(new bn(bn.UNKNOWN_ID,h,f,Rn.empty()))}return u}(e);return ay(t,n)}function el(r,e){if(typeof r[e]!="string")throw new D(P.INVALID_ARGUMENT,"Missing string value for: "+e);return r[e]}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ud{constructor(e){this._firestore=e,this.type="PersistentCacheIndexManager"}}function VI(r){var e;r=Q(r,ne);const t=tl.get(r);if(t)return t;if(((e=he(r)._uninitializedComponentsProvider)===null||e===void 0?void 0:e._offline.kind)!=="persistent")return null;const n=new Ud(r);return tl.set(r,n),n}function CI(r){qd(r,!0)}function DI(r){qd(r,!1)}function xI(r){cy(he(r._firestore)).then(e=>x("deleting all persistent cache indexes succeeded")).catch(e=>qe("deleting all persistent cache indexes failed",e))}function qd(r,e){uy(he(r._firestore),e).then(t=>x(`setting persistent cache index auto creation isEnabled=${e} succeeded`)).catch(t=>qe(`setting persistent cache index auto creation isEnabled=${e} failed`,t))}const tl=new WeakMap;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NI(r){var e;const t=(e=he(Q(r.firestore,ne))._onlineComponents)===null||e===void 0?void 0:e.datastore.serializer;return t===void 0?null:ui(t,ke(r._query))._t}function kI(r,e){var t;const n=Nl(e,(i,a)=>new ch(a,i.aggregateType,i._internalFieldPath)),s=(t=he(Q(r.firestore,ne))._onlineComponents)===null||t===void 0?void 0:t.datastore.serializer;return s===void 0?null:vh(s,Ql(r._query),n,!0).request}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MI{constructor(){throw new Error("instances of this class should not be created")}static onExistenceFilterMismatch(e){return xa.instance.onExistenceFilterMismatch(e)}}class xa{constructor(){this.Uu=new Map}static get instance(){return Vs||(Vs=new xa,function(t){if(Ks)throw new Error("a TestingHooksSpi instance is already set");Ks=t}(Vs)),Vs}et(e){this.Uu.forEach(t=>t(e))}onExistenceFilterMismatch(e){const t=Symbol(),n=this.Uu;return n.set(t,e),()=>n.delete(t)}}let Vs=null;(function(e,t=!0){(function(s){Un=s})(jm),qs(new Dr("firestore",(n,{instanceIdentifier:s,options:i})=>{const a=n.getProvider("app").getImmediate(),u=new ne(new rg(n.getProvider("auth-internal")),new og(n.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new D(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Tt(h.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:t},i),u._setSettings(i),u},"PUBLIC").setMultipleInstances(!0)),Ar(Gu,"4.7.3",e),Ar(Gu,"4.7.3","esm2017")})();const XI=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:Ca,AggregateField:Ln,AggregateQuerySnapshot:wd,Bytes:St,CACHE_SIZE_UNLIMITED:fy,CollectionReference:Ge,DocumentReference:me,DocumentSnapshot:rn,FieldPath:Nt,FieldValue:kt,Firestore:ne,FirestoreError:D,GeoPoint:_i,LoadBundleTask:Ed,PersistentCacheIndexManager:Ud,Query:we,QueryCompositeFilterConstraint:un,QueryConstraint:Hn,QueryDocumentSnapshot:Cr,QueryEndAtConstraint:rs,QueryFieldFilterConstraint:Jn,QueryLimitConstraint:ts,QueryOrderByConstraint:vi,QuerySnapshot:sn,QueryStartAtConstraint:ns,SnapshotMetadata:_t,Timestamp:le,Transaction:Bd,VectorValue:Zr,WriteBatch:Ld,_AutoId:ko,_ByteString:de,_DatabaseId:Tt,_DocumentKey:O,_EmptyAppCheckTokenProvider:ag,_EmptyAuthCredentialsProvider:El,_FieldPath:ae,_TestingHooks:MI,_cast:Q,_debugAssert:tg,_internalAggregationQueryToProtoRunAggregationQueryRequest:kI,_internalQueryToProtoQueryTarget:NI,_isBase64Available:Mg,_logWarn:qe,_validateIsNotUsedTogether:pd,addDoc:sI,aggregateFieldEqual:Ky,aggregateQuerySnapshotEqual:$y,and:ky,arrayRemove:AI,arrayUnion:wI,average:Gy,clearIndexedDbPersistence:yy,collection:ly,collectionGroup:hy,connectFirestoreEmulator:yd,count:Md,deleteAllPersistentCacheIndexes:xI,deleteDoc:rI,deleteField:TI,disableNetwork:Ty,disablePersistentCacheIndexAutoCreation:DI,doc:Id,documentId:by,enableIndexedDbPersistence:py,enableMultiTabIndexedDbPersistence:_y,enableNetwork:Ey,enablePersistentCacheIndexAutoCreation:CI,endAt:qy,endBefore:Uy,ensureFirestoreConfigured:he,executeWrite:Yn,getAggregateFromServer:Od,getCountFromServer:aI,getDoc:Hy,getDocFromCache:Jy,getDocFromServer:Yy,getDocs:Xy,getDocsFromCache:Zy,getDocsFromServer:eI,getFirestore:gy,getPersistentCacheIndexManager:VI,increment:bI,initializeFirestore:my,limit:Oy,limitToLast:Fy,loadBundle:wy,memoryEagerGarbageCollector:dI,memoryLocalCache:mI,memoryLruGarbageCollector:fI,namedQuery:Ay,onSnapshot:iI,onSnapshotsInSync:oI,or:Ny,orderBy:My,persistentLocalCache:gI,persistentMultipleTabManager:yI,persistentSingleTabManager:Fd,query:Dy,queryEqual:Ta,refEqual:dy,runTransaction:EI,serverTimestamp:vI,setDoc:tI,setIndexConfiguration:SI,setLogLevel:eg,snapshotEqual:Wy,startAfter:By,startAt:Ly,sum:zy,terminate:vy,updateDoc:nI,vector:RI,waitForPendingWrites:Iy,where:xy,writeBatch:PI},Symbol.toStringTag,{value:"Module"}));export{Dr as C,al as E,Bn as F,ul as L,jm as S,QI as _,xo as a,OI as b,xf as c,Gm as d,Ht as e,KI as f,ve as g,wn as h,qI as i,jI as j,zI as k,Pf as l,FI as m,UI as n,Y as o,BI as p,GI as q,Ar as r,LI as s,qs as t,$I as u,zm as v,gy as w,XI as x};
