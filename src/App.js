import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '',productChName:'',productNo:'',productEnName:'',productSize:'' }
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
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }
  //上传数据啊啊
  async function createNote() {
    // if (!formData.name || !formData.description) return;
    // console.log("图       "+formData.image)
    
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });

    //查看上传数据结果
    var imageArray = []
    if (formData.image) {
      for(var i = 0;i<formData.image.length;i++){
        const image = await Storage.get(formData.image[i]);
        imageArray.push(image);   
        console.log("图jieguo 前3333       "+image)
      }
      formData.image = imageArray;
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
      <h1>潮牌 产品数据上传</h1>
      {/* <input style ={{height:40}}
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Product name"
        value={formData.name}
      />
      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Product description"
        value={formData.description}
      /> */}

      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productChName': e.target.value})}
        placeholder="Product productChName"
        value={formData.productChName}
      />
      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productEnName': e.target.value})}
        placeholder="Product productEnName"
        value={formData.productEnName}
      />

      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productNo': e.target.value})}
        placeholder="Product productNo"
        value={formData.productNo}
      />
      <input style ={{height:40,marginLeft:10}}
        onChange={e => setFormData({ ...formData, 'productSize': e.target.value})}
        placeholder="Product productSize"
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

      <div style={{marginBottom: 100}}>
        {
          notes.map(note => (
            <div key={note.id || note.productNo}>
              <h2>{note.productChName}</h2>
              <p>{note.productNo}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
            {
              // note.image && <img src={note.image} style={{width: 400}} />
        }
          </div>
        ))
      }
      </div >


      

      <AmplifySignOut/>
    </div>
  );
}

export default withAuthenticator(App);

