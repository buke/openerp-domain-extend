/*---------------------------------------------------------
 * web_domain_extend
 * Copyright 2014 wangbuke <wangbuke@gmail.com>
 *---------------------------------------------------------*/

openerp.web_domain_extend = function(instance) {
    var _t = instance.web._t, _lt = instance.web._lt;

    instance.web.form.compute_domain = function(expr, fields) {
        if (! (expr instanceof Array))
            return !! expr;
        var stack = [];
        for (var i = expr.length - 1; i >= 0; i--) {
            var ex = expr[i];
            if (ex.length == 1) {
                var top = stack.pop();
                switch (ex) {
                    case '|':
                        stack.push(stack.pop() || top);
                        continue;
                    case '&':
                        stack.push(stack.pop() && top);
                        continue;
                    case '!':
                        stack.push(!top);
                        continue;
                    default:
                        throw new Error(_.str.sprintf(
                            _t("Unknown operator %s in domain %s"),
                            ex, JSON.stringify(expr)));
                }
            }

            var field = fields[ex[0]];
            if (!field) {
                throw new Error(_.str.sprintf(
                    _t("Unknown field %s in domain %s"),
                    ex[0], JSON.stringify(expr)));
            }
            var field_value = field.get_value ? field.get_value() : field.value;
            var op = ex[1];
            var val = ex[2];

            switch (op.toLowerCase()) {
                case '=':
                case '==':
                    stack.push(_.isEqual(field_value, val));
                    break;
                case '!=':
                case '<>':
                    stack.push(!_.isEqual(field_value, val));
                    break;
                case '<':
                    stack.push(field_value < val);
                    break;
                case '>':
                    stack.push(field_value > val);
                    break;
                case '<=':
                    stack.push(field_value <= val);
                    break;
                case '>=':
                    stack.push(field_value >= val);
                    break;
                case 'in':
                    if (!_.isArray(val)) val = [val];
                    stack.push(_(val).contains(field_value));
                    break;
                case 'not in':
                    if (!_.isArray(val)) val = [val];
                    stack.push(!_(val).contains(field_value));
                    break;
                case 'contains':
                    if (field.field.type === 'many2many'|| field.field.type === 'one2many'){
                        field_value = field.get("value");
                    }
                    if (!_.isarray(field_value)) field_value = [field_value];
                    stack.push(_(field_value).contains(val));
                    break;
                case 'not contains':
                    if (field.field.type === 'many2many'|| field.field.type === 'one2many'){
                        field_value = field.get("value");
                    }
                    if (!_.isarray(field_value)) field_value = [field_value];
                    stack.push(!_(field_value).contains(val));
                    break;


                default:
                    console.warn(
                        _t("Unsupported operator %s in domain %s"),
                        op, JSON.stringify(expr));
            }
        }
        return _.all(stack, _.identity);
    };

};


// vim:et fdc=0 fdl=0 foldnestmax=3 fdm=syntax:
