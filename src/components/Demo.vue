<template>
    <div class="demo">
        <div class="content">
            <div class="left">
                <div class="svgContainer" ref="svgContainer"></div>
                <div v-if="!uploaded" class="typo">
                    <h2>使用说明</h2>
                    <h4>1.初始界面</h4>
                    <p>进入界面后，下方有两个按钮，点击样例文本可以加载预设文本作为范例。</p>
                    <p>推荐使用在本标注工具下导出的文件来进行二次标注，以防止未知错误的产生。</p>
                    <h4>2.标注方法</h4>
                    <p>选中需要标注的词语，弹出选择框，选择词语标注。</p>
                    <p>点击两个词语，建立关系。</p>
                    <p>如果想要删除一个标注，右键单击即可。</p>
                    <img src="../../static/1.png" alt="图片显示失败" width="200" height="220">
                    <img src="../../static/2.png" alt="图片显示失败" width="200" height="220">
                    <h4>3.导出和上传</h4>
                    <p>先介绍一下文件格式</p>
                    <p>标注文件是一个json文件，包括如下部分:</p>
                    <table>
                      <thead>
                      <tr>
                        <th>名称</th>
                        <th>代码</th>
                        <th>含义</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr>
                        <td>内容</td>
                        <td>content</td>
                        <td>需要标注的文本内容</td>
                      </tr>
                      <tr>
                        <td>词语标签分类</td>
                        <td>labelCategories</td>
                        <td>每个标注候选词的id, 内容, 颜色等属性</td>
                      </tr>
                      <tr>
                        <td>标签</td>
                        <td>labels</td>
                        <td>在文本中已经标注好的内容及其属性, 包括id和对应的标签, 以及坐标</td>
                      </tr>
                      <tr>
                        <td>连接分类</td>
                        <td>connectionCategories</td>
                        <td>每条候选关系的id, 内容, 颜色等属性</td>
                      </tr>
                      <tr>
                        <td>关系连接</td>
                        <td>connections</td>
                        <td>在文本中已经标注好的关系及其属性, 包括id和对应的标签, 以及坐标</td>
                      </tr>
                      </tbody>
                    </table>
                    <p>标注样例可以点击下面按钮看到，这里不再展示。</p>
                    <p>如果你想对自己的文本进行标注，请确保上传的文本是这样的格式。</p>
                </div>
            </div>
            <div class="right">
                <div v-if="!uploaded" class="typo">
                  <p>写点啥</p>
                </div>
                <code v-if="uploaded" ref="code">
                </code>
            </div>

          <v-dialog v-if="uploaded" v-model="startDialog" max-width="350">
              <v-card class="fancy-card">
                <v-card-title class="title-color">准备好了吗？</v-card-title>
                <v-card-text class="text-color">
                  你准备好继续了吗？
                </v-card-text>
                <v-card-actions class="action-color">
                  <v-btn @click="loadData" class="btn-color">准备好了</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          
            <v-dialog v-if="showForceDeleteDialog" v-model="showForceDeleteDialog" max-width="350">
              <v-card class="fancy-card">
                <v-card-title class="title-color">你想要删除的Label/Connection正在使用中</v-card-title>
                <v-card-text class="text-color">
                  请手动删除所有的存在的相关标签
                </v-card-text>
                <v-card-actions class="action-color">
                  <v-btn @click="closeForceDeleteDialog" class="btn-color">取消</v-btn>
<!--                  <v-btn @click="forceDelete" class="btn-color">强行删除</v-btn>-->
                </v-card-actions>
              </v-card>
            </v-dialog>
          
            <v-dialog v-model="showLabelCategoriesDialog" persistent max-width="290">
                <v-card>
                    <v-card-title>
                        <span class="headline">请选择标签</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedLabelCategory">
                            <v-radio v-for="category in labelResult"
                                     :key="category.id"
                                     :label="category.text"
                                     :value="category.id">
                            </v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue darken-1" flat="flat" @click="showLabelCategoriesDialog = false">
                            取消
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="createLabel">
                            确定
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="showConnectionCategoriesDialog" persistent max-width="290">
                <v-card>
                    <v-card-title>
                        <span class="headline">请选择关系</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedConnectionCategory">
                            <v-radio v-for="category in this.connectionResult"
                                     :key="category.id"
                                     :label="category.text"
                                     :value="category.id"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue darken-1" flat="flat" @click="showConnectionCategoriesDialog = false">
                            取消
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="createConnection">
                            确定
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="showManageLabelDialog" persistent max-width="500">
                <v-card>
                    <v-card-title>
                        <span class="headline">标签管理</span>
                    </v-card-title>
                      <v-card-text>
                        <v-radio-group v-model="addLabelText">
                          <v-radio
                            v-for="category in this.labelResult"
                            :key="category.id"
                            :label="category.text"
                            :value="category.id"
                          >
                          </v-radio>
                        </v-radio-group>
                        <v-text-field v-model:value="addLabelText" label="输入" placeholder="该项不能为空"></v-text-field>
                      </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue darken-1" flat="flat" @click="showManageLabelDialog = false">
                            取消
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="addLabel">
                            添加Label
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="removeLabel">
                            删除选定Label
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="showManageConnectionDialog" persistent max-width="500">
                <v-card>
                    <v-card-title>
                        <span class="headline">关系管理</span>
                    </v-card-title>
                    <v-card-text>
                      <v-radio-group v-model="addConnectionText">
                        <v-radio
                            v-for="category in this.connectionResult"
                            :key="category.id"
                            :label="category.text"
                            :value="category.id"
                        >
                        </v-radio>
                      </v-radio-group>
                    <v-text-field v-model:value="addConnectionText" label="输入" placeholder="该项不能为空"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue darken-1" flat="flat" @click="showManageConnectionDialog = false">
                            取消
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="addConnection">
                            添加Connection
                        </v-btn>
                        <v-btn color="green darken-1" flat="flat" @click="removeConnection">
                            删除选定Connection
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
        <div class="bottom-bar">
            <div class="button-group">
                <button class="btn" @click="switchLanguage" style="display: none">{{ $t('message.switchLanguage') }}</button>
                <button class="btn" v-if="!uploaded" @click="useDefault">{{ $t('message.useExample') }}</button>
                <button class="btn upload-button"><input class="upload" type="file" @change="upload">
                    {{ $t("message.upload") }}
                </button>
                <button class="btn" v-if="uploaded" @click="download">
                    {{ $t("message.downloadButton") }}
                </button>
                <button class="btn" v-if="uploaded" @click="switchJSON">切换json数据和可视化表格</button>
                <button class="btn" v-if="uploaded" @click="manageLabel">管理Label</button>
                <button class="btn" v-if="uploaded" @click="manageConnection">管理Connection</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {Action, Annotator} from 'poplar-annotation'

    const defaultJson = "{\"content\":\"现在看来，TNO去魔怔化走的太过了......别的先不说，“美帝不想要和德佬相邻的盟友“是什么鬼啊...想必在OTL里，美帝一定是把西德抛弃了罢，还什么美帝陆军打不过德佬，OTL三十万对一百万都没放弃西德，况且对面还是全机械化，科技占优的红军，自己这边还是除了核战啥都不会打的原子五群师，现在武装到牙齿的你面对个腐败到根子里的德三国防军怂个啥啊。华屋秋墟版本就像是个...怎么说呢，过度合理化的产物，有时候游戏的合理性并不是唯一重要的...感觉下一步，制作组可能就要为了合理性直接砍掉高卡卡和远东国家的国策，然后进一步发现轴心国打赢二战不合理......核爆基辅的剧情倒是确实有早期TNO内味了，但海峡危机是个什么鬼啊...老版英格兰删了就删了吧，你弄个这样的半成品出来是闹哪样...\",\"labelCategories\":[{\"id\":0,\"text\":\"名词\",\"color\":\"#eac0a2\",\"borderColor\":\"#8c7361\"},{\"id\":1,\"text\":\"动词\",\"color\":\"#619dff\",\"borderColor\":\"#3c619d\"},{\"id\":2,\"text\":\"形容词\",\"color\":\"#9d61ff\",\"borderColor\":\"#613C9D\"},{\"id\":3,\"text\":\"副词\",\"color\":\"#ff9d61\",\"borderColor\":\"#995e3a\"}],\"labels\":[{\"id\":10,\"categoryId\":0,\"startIndex\":5,\"endIndex\":8},{\"id\":11,\"categoryId\":0,\"startIndex\":30,\"endIndex\":32},{\"id\":12,\"categoryId\":0,\"startIndex\":36,\"endIndex\":38},{\"id\":13,\"categoryId\":0,\"startIndex\":291,\"endIndex\":294},{\"id\":14,\"categoryId\":1,\"startIndex\":317,\"endIndex\":319},{\"id\":15,\"categoryId\":2,\"startIndex\":146,\"endIndex\":152},{\"id\":17,\"categoryId\":2,\"startIndex\":156,\"endIndex\":163},{\"id\":18,\"categoryId\":0,\"startIndex\":163,\"endIndex\":168},{\"id\":19,\"categoryId\":1,\"startIndex\":68,\"endIndex\":70},{\"id\":20,\"categoryId\":0,\"startIndex\":60,\"endIndex\":62},{\"id\":21,\"categoryId\":0,\"startIndex\":66,\"endIndex\":68}],\"connectionCategories\":[{\"id\":0,\"text\":\"修饰\"},{\"id\":1,\"text\":\"限定\"},{\"id\":2,\"text\":\"是...的动作\"}],\"connections\":[{\"id\":4,\"categoryId\":0,\"fromId\":17,\"toId\":18},{\"id\":5,\"categoryId\":2,\"fromId\":20,\"toId\":19}]}"
    export default {
        name: 'Demo',
        data: function () {
            return {
                uploaded: false,
                selectedLabelCategory: null,
                showLabelCategoriesDialog: false,
                selectedConnectionCategory: null,
                showConnectionCategoriesDialog: false,
                annotator: null,
                startIndex: -1,
                endIndex: -1,
                first: -1,
                second: -1,
                code: '',
                showManageLabelDialog:false,
                showManageConnectionDialog:false,
                addLabelText:'',
                addConnectionText:'',
                labelResult:[],
                connectionResult:[],
                startDialog:true,
                usingThisConnection: false,
                showForceDeleteDialog:false,
            }
        },
        methods: {
            constructAnnotator: function (data) {
                this.annotator = new Annotator(data, this.$refs.svgContainer);
                this.annotator.on('textSelected', (startIndex, endIndex) => {
                    this.startIndex = startIndex;
                    this.endIndex = endIndex;
                    this.showLabelCategoriesDialog = true;
                });
                this.annotator.on('labelRightClicked', (id) => {
                    this.annotator.applyAction(Action.Label.Delete(id));
                    this.getCode();
                });
                this.annotator.on('connectionRightClicked', (id) => {
                    this.annotator.applyAction(Action.Connection.Delete(id));
                    this.getCode();
                });
                this.annotator.on('textSelected', (startIndex, endIndex) => {
                    this.startIndex = startIndex;
                    this.endIndex = endIndex;
                    this.showLabelCategoriesDialog = true;
                });
                this.annotator.on('twoLabelsClicked', (first, second) => {
                    this.first = first;
                    this.second = second;
                    this.showConnectionCategoriesDialog = true;
                });
                setTimeout(() => this.getCode(), 100);
            },
            useDefault: function () {
                this.uploaded = true;
                this.constructAnnotator(defaultJson);
            },
            upload: function (e) {
                let reader = new FileReader();
                if (this.annotator !== null) {
                    this.$refs.svgContainer.innerHTML = "";
                }
                reader.readAsText(e.target.files[0]);
                reader.onload = (event) => {
                    this.constructAnnotator(event.target.result);
                    this.uploaded = true;
                }
            },
            createLabel() {
                this.annotator.applyAction(Action.Label.Create(this.selectedLabelCategory, this.startIndex, this.endIndex));
                this.showLabelCategoriesDialog = false;
                this.getCode();
            },
            createConnection() {
                this.annotator.applyAction(Action.Connection.Create(this.selectedConnectionCategory, this.first, this.second));
                this.showConnectionCategoriesDialog = false;
                this.getCode();
            },
            getCode: function () {
                if (this.annotator === null) {
                    this.code = '';
                }
                this.$refs.code.innerHTML = JSON.stringify(this.annotator.store.json, null, 2);
                setTimeout(() => hljs.highlightBlock(this.$refs.code), 5000);
            },
            download: function () {
                let eleLink = document.createElement('a');
                eleLink.download = 'data.json';
                eleLink.style.display = 'none';
                let blob = new Blob([JSON.stringify(this.annotator.store.json)]);
                eleLink.href = URL.createObjectURL(blob);
                document.body.appendChild(eleLink);
                eleLink.click();
                document.body.removeChild(eleLink);
            },
            switchLanguage: function () {
                if (this.$i18n.locale === 'zh')
                    this.$i18n.locale = 'en';
                else
                    this.$i18n.locale = 'zh';
            },
            switchJSON: function() {
              let jsonData = JSON.stringify(this.annotator.store.json, null, 2);
              if (this.$refs.code.innerHTML !== jsonData) {
                console.log('切换到了 JSON 数据');
                this.$refs.code.innerHTML = jsonData;
              } else {
                console.log('切换到了可视化表格数据');
                let tableHtml = '<div class="table-wrapper">';

                // Label Categories
                let labelCategoriesJson = JSON.stringify(this.annotator.store.json.labelCategories, null, 2);
                tableHtml += this.generateTable('Label Categories', labelCategoriesJson);

                // Connection Categories
                let connectionCategoriesJson = JSON.stringify(this.annotator.store.json.connectionCategories, null, 2);
                tableHtml += this.generateTable('Connection Categories', connectionCategoriesJson);

                // Labels
                let labelsJson = JSON.stringify(this.annotator.store.json.labels, null, 2);
                tableHtml += this.generateTable('Labels', labelsJson);

                // Connections
                let connectionsJson = JSON.stringify(this.annotator.store.json.connections, null, 2);
                tableHtml += this.generateTable('Connections', connectionsJson);

                tableHtml += '</div>';
                this.$refs.code.innerHTML = tableHtml;
              }
            },
            generateTable: function(caption, jsonData) {
              let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
              tableHtml += `<caption style="font-size: 15px;">${caption}</caption>\n`;

              if (jsonData !== '') {
                const jsonParsed = JSON.parse(jsonData);
                tableHtml += '<thead style="background-color: #32a852; color: #fff;"><tr>';
                Object.keys(jsonParsed[0]).forEach((key) => {
                  tableHtml += `<th style="border: 1px solid #32a852; padding: 15px; text-align: left;">${key}</th>`;
                });
                tableHtml += '</tr></thead>';
                tableHtml += '<tbody>';
                jsonParsed.forEach((item) => {
                  tableHtml += '<tr>';
                  Object.values(item).forEach((value) => {
                    tableHtml += `<td style="border: 1px solid #32a852; padding: 10px; text-align: left;">${value}</td>`;
                  });
                  tableHtml += '</tr>';
                });
                tableHtml += '</tbody>';
              }
              tableHtml += '</table>';
              return tableHtml;
            },
            manageLabel: function(){
              this.showManageLabelDialog = true;
            },
            manageConnection: function(){
              this.showManageConnectionDialog = true;
            },
            addLabel: function() {
              for (let [_, category] of this.annotator.store.labelCategoryRepo) {
                  this.labelResult.push(category);
              }
              let newID = -1;
              for (let [_, category] of this.annotator.store.labelCategoryRepo) {
                  newID = category["id"]+1 //循环一遍，蠢逼方法
              }
              const newLabelCategory = {
                id: newID, //这里不能再用length了，考虑使用最大id+1
                text: this.addLabelText.toString(),
                color: this.getRandomColor(),
                borderColor: this.getRandomColor()
              };
              this.annotator.store.labelCategoryRepo.add(newLabelCategory)
              this.labelResult = []
              for (let [_, category] of this.annotator.store.labelCategoryRepo) {
                  this.labelResult.push(category);
              }
              this.getCode()
            },
            removeLabel: function(){
              let labelRepo = []
              for (let [_, category] of this.annotator.store.labelRepo) {
                  if(parseInt(this.addLabelText, 10) === category.categoryId)
                    labelRepo.push(category);
              }
              if(labelRepo.length===0){
                let deleteID = parseInt(this.addLabelText,10);
                this.annotator.store.labelCategoryRepo.delete(deleteID)
                this.getCode()
                this.labelResult = []
                for (let [_, category] of this.annotator.store.labelCategoryRepo) {
                    this.labelResult.push(category);
                }
              }
              else
                this.showForceDeleteDialog = true;
            },
            addConnection: function(){
              for (let [_, category] of this.annotator.store.connectionCategoryRepo) {
                  this.connectionResult.push(category);
              }
              let newID = -1;
              for (let [_, category] of this.annotator.store.connectionCategoryRepo) {
                  newID = category["id"]+1
              }
              const newConnectionCategory = {
                id: newID,
                text: this.addConnectionText.toString(),
              };
              this.annotator.store.connectionCategoryRepo.add(newConnectionCategory)
              this.connectionResult = []
              for (let [_, category] of this.annotator.store.connectionCategoryRepo) {
                  this.connectionResult.push(category);
              }
              this.getCode()
            },
            removeConnection: function(){
              let connectionRepo = []
              for (let [_, category] of this.annotator.store.connectionRepo) {
                  if(parseInt(this.addConnectionText, 10) === category.categoryId)
                    connectionRepo.push(category);
              }
              if(connectionRepo.length===0){
                let deleteID = parseInt(this.addConnectionText,10);
                this.annotator.store.connectionCategoryRepo.delete(deleteID)
                this.getCode()
                this.connectionResult = []
                for (let [_, category] of this.annotator.store.connectionCategoryRepo) {
                    this.connectionResult.push(category);
                }
              }
              else
                this.showForceDeleteDialog = true;
            },
            getRandomColor:function(){
              const letters = '0123456789ABCDEF';
              let color = '#';
              for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
              }
              return color;
            },
            loadData:function(){
              this.startDialog = false
              for (let [_, category] of this.annotator.store.labelCategoryRepo) {
                    this.labelResult.push(category);
              }
              for (let [_, category] of this.annotator.store.connectionCategoryRepo) {
                    this.connectionResult.push(category);
              }//一开始加一个dialog,逼user点确认来装载数据
              this.labelResult = Array.from(new Set(this.labelResult))
              this.connectionResult = Array.from(new Set(this.connectionResult))
            },
            closeForceDeleteDialog:function(){
              this.showForceDeleteDialog = false
            },
        },
        computed: {
            labelCategories: function () {
                if (this.annotator === null) return [];
                let result = [];
                for (let [_, category] of this.annotator.store.labelCategoryRepo) {
                    result.push(category);
                }
                return result;
            },
            connectionCategories: function () {
                if (this.annotator === null) return [];
                let result = [];
                for (let [_, category] of this.annotator.store.connectionCategoryRepo) {
                    result.push(category);
                }
                return result;
            }
        },
    }
</script>

<style scoped>
    h1, h2, button {
        font-weight: 300 !important;
    }

    .demo {
        max-height: 100vh;
    }

    .content {
        height: calc(100vh - 60px);
        max-height: calc(100vh - 60px);
        display: flex;
        justify-content: center;
    }

    .bottom-bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: #0066CC;
        height: 60px;
    }

    .button-group {
        width: 100%;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .btn {
        color: white;
        box-shadow: rgba(0, 0, 0, 0.2) 0 3px 1px -2px, rgba(0, 0, 0, 0.137255) 0 2px 2px 0, rgba(0, 0, 0, 0.117647) 0 1px 5px 0;
        background: rgb(33, 150, 243);
        border: none;
        border-radius: 2px;
        padding: 6px 16px;
        margin-left: 1em;
        margin-right: 1em;
        font-size: 14px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        font-weight: normal !important;
    }

    .btn:hover {
        cursor: pointer;
        background: rgb(32, 163, 255);
    }

    .left {
        display: inline-block;
        border-right: solid 2px #c8c8b7;
        width: 50%;
        max-width: 50vw;
        height: calc(100vh - 60px);
        max-height: calc(100vh - 60px);
        overflow: scroll;
        padding-left: 16px;
        padding-right: 16px;
        flex: 1;
    }

    .right {
        display: inline-block;
        border-left: solid 2px #c8c8b7;
        width: 50%;
        height: calc(100vh - 60px);
        max-height: calc(100vh - 60px);
        overflow: scroll;
        padding-left: 16px;
        padding-right: 16px;
        flex: 1;
    }

    .svgContainer {
        display: inline-block;
        font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-weight: normal;
        font-size: 14px;
        max-width: 50vw;
    }

    .upload-button {
        width: 56px;
        padding-right: 0;
        padding-left: 0;
        cursor: pointer;
    }

    .upload {
        position: absolute;
        margin-left: -15px;
        margin-top: -6px;
        width: 56px;
        height: 37px;
        opacity: 0;
        cursor: pointer;
    }

    .typo a {
        color: #18b495
    }

    input {
        cursor: pointer;
    }
    .table-wrapper {
      max-width: 100%;
      overflow-x: auto;
      border: 2px solid #32a852; /* 深绿色 */
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      background-color: #fffeee;
    }

    .table-wrapper table {
      width: 100%;
      border-collapse: collapse;
    }

    .table-wrapper th, .table-wrapper td {
      border: 1px solid #32a852; /* 深绿色 */
      padding: 15px;
      text-align: left;
    }

    .table-wrapper th {
      background-color: #32a852; /* 深绿色 */
      color: #fff;
    }

    .table-wrapper tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .table-wrapper tr:hover {
      background-color: #e5e5e5;
    }

    .table-wrapper .center {
      text-align: center;
    }
    .fancy-card {
      background-color: #f0f0f0; /* 卡片背景色 */
      border-radius: 10px; /* 卡片圆角 */
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); /* 阴影效果 */
    }
    .title-color {
      color: #3498db; /* 标题颜色 */
    }

    .text-color {
      color: #555; /* 文本颜色 */
    }
    .btn-color {
      color: #100eee; /* 按钮文字颜色 */
    }
    .action-color {
      background-color: #3498db; /* 按钮区域背景色 */
    }
</style>

