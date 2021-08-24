import React, { useState, useEffect } from 'react';
import './App.css';
import { API, sectionFooterPrimaryContent, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = {productChName:'',productNo:'',productEnName:'',productSize:'' }
var imageArrayName = []
function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);


  //选择图片
  async function onChange(e) {
    imageArrayName = []
    for(var i = 0;i<e.target.files.length;i++){
      const file = e.target.files[i];
      imageArrayName.push(file.name)
      console.log(imageArrayName)
    }
    var jsonStr = JSON.stringify(imageArrayName)
    setFormData({ ...formData, image: jsonStr});
    for(var i = 0;i<e.target.files.length;i++){
      await Storage.put(imageArrayName[i], e.target.files[i]);  
    }
    fetchNotes();
  }
  //检索数据库数据
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      console.log("测试存储数据图片image     " +note.image)
      if (note.image) {
        var myobj = eval(note.image);
        const image = await Storage.get(myobj[0]);
        note.image = "https://2021reactapp0818a8cb7d7dcbdf4d99a2f6e7e64270337152331-dev.s3.ap-northeast-1.amazonaws.com/public/"+myobj[0];
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }
  //上传数据啊啊
  async function createNote() {

    if(!formData.productChName || !formData.productEnName || !formData.productNo || !formData.productSize || !formData.image){

      alert("请完善产品信息");
      return;

    }
    
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });

    //查看上传数据结果

    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }

    // var imageArray = []
    if (formData.image) {
      // for(var i = 0;i<formData.image.length;i++){
      //   const image = await Storage.get(formData.image[i]);
      //   imageArray.push(image);   
      //   console.log("图jieguo 前3333       "+image)
      // }

      const image = await Storage.get(formData.image);
      formData.image = "https://2021reactapp0818a8cb7d7dcbdf4d99a2f6e7e64270337152331-dev.s3.ap-northeast-1.amazonaws.com/public/"+imageArrayName[0];;
    }

    setNotes([ ...notes, formData ]);

    
    setFormData(initialFormState);
  }
  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }
  return (
    <div className="App">
      <h1>Ananke 潮牌产品上传</h1>
      

      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productChName': e.target.value})}
        placeholder="ProductChName"
        value={formData.productChName}
      />
      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productEnName': e.target.value})}
        placeholder="ProductEnName"
        value={formData.productEnName}
      />

      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productNo': e.target.value})}
        placeholder="ProductNo"
        value={formData.productNo}
      />
      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productSize': e.target.value})}
        placeholder="ProductSize"
        value={formData.productSize}
      />

      <div style={{marginBottom: 100}}>
        <input style ={{height:40,marginLeft:20,marginTop:50}}
          type="file"
          multiple="multiple"
          onChange={onChange}
        />
        <button style ={{height:40}} onClick={createNote}>Create Product</button>
      </div >

      <view style={{marginBottom: 100}}>
        {
          notes.map(note => (
            <view key={note.id || note.productNo}>
              
              <div>
                <h2>{note.productChName}</h2>
              </div>

              <p>{note.productNo}</p>
              
              {
                note.image && <img src={note.image} style={{width: 400,backgroundColor:'blue'}} />
              }
              <div style={{height:50}}>
                <button  onClick={() => deleteNote(note)}>Delete product</button>
              </div>


          </view>
        ))
      }
      </view >

      <AmplifySignOut/>
    </div>
  );
}

export default withAuthenticator(App);

