

let Components = null;

let pickComponent = {

    data() {
        return {
            group: null,
            filter: ''
        }
    },

    props: {
        components: {
            type: Object
        }
    },

    computed: {

        filtered() {

            let components = {}, component = null;

            Object.keys(this.components || {}).forEach(name => {

                if (this.filter && !`${name} ${this.components[name].label || ''}`.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase())) {
                    return;
                }

                if (this.group && this.components[name].group != this.group ) return;
                components[name] = this.components[name]
            });

            return components;
        },

        groups() {
            let groups = [];

            Object.keys(this.components || {}).forEach(name => {
                if (!this.components[name].group || groups.indexOf(this.components[name].group) > -1) return;
                groups.push(this.components[name].group);
            });

            return groups.sort();
        }
    },

    template: /*html*/`
        <div class="app-offcanvas-container">

            <div class="kiss-padding kiss-size-4 kiss-text-bold kiss-margin-bottom kiss-flex kiss-flex-middle">
                <div class="kiss-margin-small-right">
                    <kiss-svg :src="$base('layout:assets/icons/component.svg')" width="40" height="40"></kiss-svg>
                </div>
                {{ t('Pick a component') }}
            </div>

            <app-tabs static="true" v-if="groups.length">
                <ul class="app-tabs-nav kiss-margin-remove">
                    <li :active="group === null">
                        <a class="app-tabs-nav-link" @click="group = null">{{t('All')}}</a>
                    </li>
                    <li :active="group == name" v-for="name in groups">
                        <a class="app-tabs-nav-link" @click="group = name">{{ name }}</a>
                    </li>
                </ul>
            </app-tabs>

            <div class="kiss-padding">
                <input type="text" class="kiss-input" :placeholder="t('Filter components...')" v-model="filter">
            </div>

            <div class="app-offcanvas-content kiss-padding">

                <kiss-row class="kiss-row-small kiss-child-width-1-2 kiss-child-width-1-4@m kiss-child-width-1-5@xl">
                    <div v-for="meta, component in filtered">
                        <kiss-card class="kiss-padding-small kiss-align-center kiss-position-relative" theme="bordered" hover="shadow contrast">
                            <div class="kiss-position-relative">
                                <canvas width="600" height="250"></canvas>
                                <div class="kiss-cover kiss-flex kiss-flex-middle kiss-flex-center kiss-color-muted">
                                    <div><kiss-svg :src="$base(meta.icon || 'layout:assets/icons/component.svg')" width="30" height="30"></kiss-svg></div>
                                </div>
                            </div>
                            <div class="kiss-size-xsmall kiss-text-bold">{{ meta.label || component }}</div>
                            <a class="kiss-cover" @click="select(component)"></a>
                        </kiss-card>
                    </div>
                </kiss-row>

            </div>

        </div>
    `,

    methods: {
        select(component) {
            this.$call('select', component);
            this.$close();
        }
    }
}

let editComponent = {

    data() {
        return {
            meta: Components[this.component.component],
            item: _.cloneDeep(this.component)
        }
    },

    props: {
        component: {
            type: Object,
            default: null
        }
    },

    components: {
        'fields-renderer': Vue.defineAsyncComponent(() => App.utils.import('settings:assets/vue-components/fields-renderer.js'))
    },

    template: /*html*/`
        <div>
            <span class="kiss-size-xsmall kiss-color-muted kiss-text-upper">{{ item.component }}</span>
            <div class="kiss-size-4 kiss-text-bold kiss-margin-xsmall-top kiss-margin-bottom">{{ t('Edit component') }}</div>

            <input class="kiss-input" type="text" v-model="item.label">

            <fields-renderer class="kiss-margin" v-model="item.data" :fields="meta.fields"></fields-renderer>

            <div class="kiss-margin-top kiss-flex kiss-flex-middle kiss-button-group">
                <button type="button" class="kiss-button kiss-flex-1" @click="$close()">{{ t('Cancel') }}</button>
                <button type="button" class="kiss-button kiss-button-primary kiss-flex-1" @click="save">{{ t('Save') }}</button>
            </div>
        </div>
    `,

    methods: {
        save() {
            Object.assign(this.component, this.item);
            this.$close();
        }
    }

}


let instanceCount = 0;

export default {

    name: 'field-layout',

    _meta: {
        label: 'Layout',
        info: 'Build custom component based layouts',
        icon: 'layout:assets/icons/layout.svg'
    },

    data() {
        return {
            uid: `field-layout-${++instanceCount}`,
            val: this.modelValue || [],
            ready: false,
            showPreview: this.preview
        }
    },

    mounted() {
        App.utils.import('/layout/components').then(m => {
            Components = m.default;
            this.ready = true;
        });
    },

    props: {
        modelValue: {
            type: Array,
            default: []
        },
        group: {
            type: String,
            default: null
        },
        level: {
            type: Number,
            default: 0
        }
    },

    components: {
        componentPreview: {
            data() {
                return {
                    preview: Components[this.component.component].preview
                }
            },
            props: {
                component: {
                    type: Object
                }
            },
            computed: {
                data() {
                    return this.component.data;
                }
            },
            template: /*html*/`
                <div v-is="{props:['data'], template:preview}" :data="data"></component>
            `
        }
    },

    watch: {
        val: {
            handler() { this.update() },
            deep: true
        },
        modelValue: {
            handler(val) {
                this.val = this.modelValue || [];
                this.update();
            },
            deep: true
        }
    },

    template: /*html*/`
        <div field="layout" v-if="ready">

            <vue-draggable
                :list="val"
                :group="group || uid"
                @change="change"
                handle=".lm-handle"
                class="field-layout-dragarea"
                :swapThreshold="0.65"
                :animation="150",
                :fallbackOnBody="true",
                style="min-height: 100px;"
            >
                <template #item="{ element }">
                    <kiss-card class="kiss-padding-small kiss-visible-toggle" theme="bordered contrast" style="margin: 8px 0;">
                        <div class="kiss-flex kiss-flex-middle">
                            <a class="lm-handle kiss-margin-small-right kiss-color-muted"><icon>drag_handle</icon></a>
                            <div class="kiss-flex-1 kiss-size-xsmall kiss-text-bold kiss-text-truncate">
                                <a class="kiss-link-muted" @click="edit(element)">{{ element.label }}</a>
                            </div>
                            <span class="kiss-margin-small-left kiss-badge kiss-badge-outline kiss-color-muted kiss-text-upper kiss-invisible-hover">{{ element.component }}</span>
                            <a class="kiss-margin-small-left kiss-color-danger" @click="remove(element)"><icon>delete</icon></a>
                        </div>
                        <field-layout class="kiss-margin-small" v-model="element.children" :group="group || uid" :level="++level" v-if="element.children"></field-layout>
                        <div class="kiss-margin-xsmall-top kiss-size-small" v-is="'component-preview'" :component="element" :preview="showPreview" v-if="showPreview && !element.children && hasPreview(element)"></div>
                    </kiss-card>
                </template>
            </vue-draggable>

            <div class="kiss-margin-small kiss-align-center" v-if="level>0">
                <a @click="addComponent"><icon :class="{'kiss-size-small':level}">control_point</icon></a>
            </div>

            <div class="kiss-button-group kiss-margin-small" v-if="!level">
                <a class="kiss-button kiss-button-small" @click="addComponent">{{ t('Add component') }}</a>
                <a class="kiss-button kiss-button-small" @click="showPreview = !showPreview">{{ t('Toggle preview') }}</a>
            </div>

        </div>
    `,

    methods: {

        addComponent() {

            App.utils.vueOffcanvas(pickComponent, {components: Components}, {

                select: component => {

                    let meta = Components[component], data = {};

                    (meta.fields || []).forEach(field => {
                        data[field.name] = field.default || null;
                    });

                    this.val.push({
                        component,
                        label: meta.label || component,
                        children: meta.children ? [] : null,
                        data
                    });
                }
            }, {flip: true, size: 'xlarge'})

        },

        edit(item) {

            let meta = Components[item.component];

            App.utils.vueModal(editComponent, {component: item}, {

            }, {size: 'large'})
        },

        remove(item) {
            this.val.splice(this.val.indexOf(item), 1);
            this.update();
        },

        change(evt) {
            this.update();
        },

        update() {
            this.$emit('update:modelValue', this.val)
        },

        hasPreview(component) {
            if (Components[component.component] && Components[component.component].preview) {
                return true;
            }

            return false;
        }
    }
}