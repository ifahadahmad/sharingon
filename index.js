const tableForElement = new Map();


class sharingon{

    allNodes = []
    // sharingonNodes = []
    // Get All Nodes within app element
    constructor(tableForElement){
        this.tableForElement = tableForElement;
    }
    loop = (node)=>{
        const children = node.childNodes;

        for(let i=0;i<children.length;i++){
            const node = children[i];
            this.allNodes.push({nodeName:node.nodeName,node:node});
            if(node.childNodes.length>0)
                this.loop(node);
        }
    }
    // Parse the String for possible state value

    parseStr(str){
        const re = /\{\{(.*?)\}\}/g;
        let match = re.exec(str);
        const results = [];
        while(match!=null){
            results.push(match[1]);
            match = re.exec(str);
        }
        return results;
    }

    linkData(template,vars,node){
        let newTemplate = template;
        for(let i=0;i<vars.length;i++){
            const v = vars[i];

            newTemplate = template.replaceAll(`{{${v}}}`,'${'+v+'}');
            
        }
        for(let i=0;i<vars.length;i++){
            let v = vars[i];
            let key;
            const parseVar = new Function('props', `return ${v?.substr(0,v.indexOf('.'))}`)(this.props);
            if(parseVar?.type==="state"){
                key = parseVar.id;
            }else{
                key = v;
            }
            if(this.tableForElement.get(key)){
                this.tableForElement.get(key).push({
                    template:  new Function('props','return () =>{  return `' + newTemplate.trim() + '` }')(this.props),
                    key : template,
                    element:node
                })
            }else{
                this.tableForElement.set(key,[{
                    template:  new Function('props','return () =>{  return `' + newTemplate.trim() + '` }')(this.props),
                    key : template,
                    element:node
                }])
            }
        }

    }



    convertToTemplate(){
     
        for(let i=0;i<this.allNodes.length;i++){
           
            const node = this.allNodes[i].node;
            if(node.data){
                 
                const template = node.data;
                template.replaceAll(/\s+/g,' ');
                const vars = this.parseStr(template);
    
                
                // this.tableForElement.set(template,node);
                this.linkData(template,vars,node);
            }


        }   

    }

    
 }
     function renderHtml(key){
        let nodes = tableForElement.get(key);
        nodes.map(el=>{
        const template = el?.template();
        const node = el.element;
        if(node?.element?.innerHTML)
        node.innerHTML = template;
        else if(node?.textContent)
            node.textContent = template
    })

    }

    function render(node=null){
        if(node===null){
            [...tableForElement.keys()].map(key=>{
                renderHtml(key);
            })
        }
    }
 const stateMap = new Map();
 const useState = (defaultValue) => {
    const newState = new Proxy({
        type:"state",
        id: stateMap.size,
        state: defaultValue,
    },{
        get: function(target, prop, receiver){
            if(prop===null||prop===undefined)
                return target.state;
            return Reflect.get(...arguments);
        },
        set: function(target, prop, value){
            target["state"] = value;
            renderHtml(target?.id);
            return true;
        }
    })
    stateMap.set(newState.id,newState);
    return newState;
 }

 const init = (el)=> {
    const z = new sharingon(tableForElement);
    window.z = z;
    z.loop(el);
    z.convertToTemplate();
    render();
 }