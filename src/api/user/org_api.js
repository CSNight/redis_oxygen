import axios from 'axios'

let get_org_tree = function () {
    return axios.get('http://localhost:8020/org/get_org_tree', {});
};


export default get_org_tree