import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { theme } from './colors'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = "@toDos"
const WORKING_KEY = "@working"

export default function App() {
  const [working, setWorking] = useState(true)
  const [text, setText] = useState("")
  const [editText, setEditText] = useState("")
  const [toDos, setToDos] = useState({})
  useEffect(() => {
    loadWorking()
    loadToDos()
  }, [])
  const loadWorking = async () => {
    const w = await AsyncStorage.getItem(WORKING_KEY)
    if (w) {setWorking(JSON.parse(w))}
  }
  const travel = async () => {
    setWorking(false)
    await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(false))
  }
  const work = async () => {
    setWorking(true)
    await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(true))
  }
  const onChangeText = (event) => setText(event)
  const onChangeEditText = (event) => setEditText(event)
  const editFinish = async (key) => {
    const newToDos = { ...toDos }
    newToDos[key].edit = false
    newToDos[key].text = editText
    setToDos(newToDos)
    await saveToDos(newToDos)
    setEditText("")
  }
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY)
    if (s){setToDos(JSON.parse(s))}
  }
  const addToDo = async () => {
    if (text === "") { return }
    const newToDos = { ...toDos, [Date.now()]: { text, working, done:false, edit: false } }
    setToDos(newToDos)
    await saveToDos(newToDos)
    setText("")
  }
  const deleteToDo = async (key) => {
    if (Platform.OS === "web"){
      const ok = confirm("삭제하시겠습니까?")
      if (ok) {
      const newToDos = { ...toDos }
      delete newToDos[key]
      setToDos(newToDos)
      await saveToDos(newToDos)}
    }
    else {
      Alert.alert("삭제하시겠습니까?",
      "삭제한 후에는 되돌릴 수 없습니다.",
      [{
        text: "삭제", 
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos }
          delete newToDos[key]
          setToDos(newToDos)
          await saveToDos(newToDos)
        }
      }, { text: "취소" }]
    )
    return
    }
    
  }
  const editToDo = async (key) => {
    const newToDos = { ...toDos }
    newToDos[key].edit = true
    setToDos(newToDos)
    await saveToDos(newToDos)
    return
  }
  const doneToDo = async (key) => {
    const newToDos = { ...toDos }
    newToDos[key].done = true
    setToDos(newToDos)
    await saveToDos(newToDos)
    return
  }
  const deleteAll = async () => {
    Alert.alert("삭제하시겠습니까?",
      "삭제한 후에는 되돌릴 수 없습니다.",
      [{
        text: "삭제", 
        style: "destructive",
        onPress: async () => {
          setToDos({})
          await saveToDos({})
        }
      }, { text: "취소" }]
    )
    return
    
  }
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "red" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "red" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType='done'
        value={text}
        placeholder={working ? "할 일을 추가하세요." : "여행지를 추가하세요."}
        style={styles.input} />
      <ScrollView>
      <View><Text style={styles.text}>{working ? "할 일" : "지역"}</Text></View>
        {Object.keys(toDos).map(key => (
          toDos[key].working === working ? (
            !toDos[key].done ?    
          (<View style={styles.toDo} key={key}>
            {toDos[key].edit ? 
              <TextInput
              onSubmitEditing={() => editFinish(key)}
              onChangeText={onChangeEditText}
              returnKeyType='done'
              value={editText}
              placeholder="변경할 텍스트 입력"
              style={styles.inputEdit} />
              : <Text style={styles.toDoText}>{toDos[key].text}</Text>}
              <View style={styles.buttons}>
              <TouchableOpacity onPress={() => doneToDo(key)}>
                <MaterialIcons name="done" size={20} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => editToDo(key)}>
                <FontAwesome name="edit" size={20} color="gray" style={{marginHorizontal: 12}} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <FontAwesome name="trash" size={20} color="gray" style={{bottom:1}} />
              </TouchableOpacity>
              </View>
            </View>)
            : null)
             : null))}
      <View style={styles.doneBorder}><Text style={styles.text}>완료됨</Text></View>
      {Object.keys(toDos).map(key => (
          toDos[key].working === working ? (
            toDos[key].done ?    
            (
              <View>
                <View style={styles.toDoDone} key={key}>
                  <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <FontAwesome name="trash" size={20} color="gray" style={{ bottom: 1 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )
            : null)
             : null))}
      </ScrollView>
      <TouchableOpacity onPress={deleteAll} style={styles.deleteAll}>
          <Text style={{color: "red", fontSize: 18}}>전체 삭제</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  text: {
    color: "white",
    fontSize: 18,
    margin: 10
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100
  },
  btnText: {
    fontSize: 38,
    fontWeight: 600,
    color: "white"
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18
  },
  inputEdit: {
    backgroundColor: "gray",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 15
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 13,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  doneBorder: {
    marginTop: 30
  },
  toDoDone: {
    backgroundColor: "#2E2E2E",
    marginBottom: 13,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  toDoText: {
    color: "white",
    fontSize: 18,
    fontWeight: 500
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center"
  },
  deleteAll: {
    marginBottom: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.grey,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
  }
});