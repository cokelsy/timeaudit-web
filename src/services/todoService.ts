import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Todo {
  id: string;
  content: string;
  deadline: Date | null;
  completed: boolean;
  userId: string;
  createdAt: Date;
}

export interface TodoFormData {
  content: string;
  deadline?: Date;
}

const COLLECTION = 'todos';

function fromFirestore(snapshot: any, id: string): Todo {
  return {
    id,
    content: snapshot.content,
    deadline: snapshot.deadline ? snapshot.deadline.toDate() : null,
    completed: snapshot.completed ?? false,
    userId: snapshot.userId,
    createdAt: snapshot.createdAt?.toDate() ?? new Date(),
  };
}

export async function getTodosByUser(userId: string): Promise<Todo[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const todos = snapshot.docs.map((d) => fromFirestore(d.data(), d.id));
  todos.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return todos;
}

export async function getTodosWithDeadlineByDate(
  userId: string,
  start: Date,
  end: Date
): Promise<Todo[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const todos = snapshot.docs
    .map((d) => fromFirestore(d.data(), d.id))
    .filter((t) => !t.completed && t.deadline && t.deadline >= start && t.deadline < end)
    .sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()));
  return todos;
}

export async function createTodo(userId: string, data: TodoFormData): Promise<Todo> {
  const colRef = collection(db, COLLECTION);
  const docRef = await addDoc(colRef, {
    content: data.content,
    deadline: data.deadline ? Timestamp.fromDate(data.deadline) : null,
    completed: false,
    userId,
    createdAt: Timestamp.fromDate(new Date()),
  });
  return {
    id: docRef.id,
    content: data.content,
    deadline: data.deadline ?? null,
    completed: false,
    userId,
    createdAt: new Date(),
  };
}

export async function updateTodo(
  id: string,
  data: Partial<{ content: string; deadline: Date | null; completed: boolean }>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  const updateData: Record<string, any> = { ...data };
  if (data.deadline !== undefined) {
    updateData.deadline = data.deadline ? Timestamp.fromDate(data.deadline) : null;
  }
  await updateDoc(docRef, updateData);
}

export async function deleteTodo(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}