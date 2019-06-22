import Creator, {creatorFactory} from './creator';
import {extend, isPlainObject, isString, isValidChildren} from '@form-create/utils';

export default function makerFactory() {
    let maker = {};


    const commonMaker = creatorFactory('');

    extend(maker, {
        create(type, field, title) {
            let make = commonMaker('', field);
            make._data.type = type;
            make._data.title = title;
            return make;
        },
        createTmp(template, vm, field, title) {
            let make = commonMaker('', field);
            make._data.type = 'template';
            make._data.template = template;
            make._data.title = title;
            make._data.vm = vm;
            return make;
        }
    });
    maker.template = maker.createTmp;
    maker.parse = parse;

    return maker;
}

function parse(rule, toMaker = false) {
    if (isString(rule)) rule = JSON.parse(rule);

    if (rule instanceof Creator) return toMaker ? rule : rule.getRule();
    if (isPlainObject(rule)) {
        const maker = ruleToMaker(rule);
        return toMaker ? maker : maker.getRule();
    } else if (!Array.isArray(rule)) return rule;
    else {
        const rules = rule.map(r => parse(r, toMaker));
        Object.defineProperty(rules, 'find', {
            value: findField,
            enumerable: false,
            configurable: false
        });

        return rules;
    }
}

function findField(field) {
    let children = [];
    for (let i in this) {
        const rule = this[i] instanceof Creator ? this[i].rule : this[i];
        if (rule.field === field) return this[i];
        if (isValidChildren(rule.children)) children = children.concat(rule.children);
    }
    if (children.length > 0) return findField.call(children, field);
}

function ruleToMaker(rule) {
    const maker = new Creator();
    Object.keys(rule).forEach(key => {
        maker._data[key] = rule[key];
    });
    return maker;
}