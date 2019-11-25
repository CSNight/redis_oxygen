<script>
    export default {
        name: 'MenuItem',
        functional: true,
        props: {
            icon: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            },
            id: {
                type: String,
                default: ''
            }
        },
        render(h, context) {
            const {icon, title} = context.props;
            const vnodes = [];
            if (icon) {
                if(icon.indexOf('fa-')!==-1){
                    vnodes.push(<fa-icon icon-class={icon}/>);
                }else if(icon.indexOf('svg-')!==-1){
                    vnodes.push(<svg-icon icon-class={icon}/>);
                }

            }
            if (title) {
                vnodes.push(<span><slot name='title'>{(title)}</slot></span>);
            }
            return vnodes;
        }
    }
</script>