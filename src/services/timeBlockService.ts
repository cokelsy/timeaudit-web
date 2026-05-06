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
import type { CategoryKey } from '@/utils/constants';

export interface TimeBlock {
  id: string;
  title: string;
  category: CategoryKey;
  start: Date;
  end: Date;
  userId: string;
  createdAt: Date;
}

export interface TimeBlockFormData {
  title: string;
  category: CategoryKey;
  start: Date;
  end: Date;
}

const COLLECTION = 'time_blocks';

function toFirestore(data: TimeBlockFormData, userId: string) {
  return {
    title: data.title,
    category: data.category,
    start: Timestamp.fromDate(data.start),
    end: Timestamp.fromDate(data.end),
    userId,
    createdAt: Timestamp.fromDate(new Date()),
  };
}

function fromFirestore(snapshot: any, id: string): TimeBlock {
  return {
    id,
    title: snapshot.title,
    category: snapshot.category,
    start: snapshot.start.toDate(),
    end: snapshot.end.toDate(),
    userId: snapshot.userId,
    createdAt: snapshot.createdAt?.toDate() ?? new Date(),
  };
}

export async function getTimeBlocksByRange(
  userId: string,
  start: Date,
  end: Date
): Promise<TimeBlock[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const blocks = snapshot.docs
    .map((doc) => fromFirestore(doc.data(), doc.id))
    .filter((b) => b.start < end && b.end > start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  return blocks;
}

export async function createTimeBlock(
  userId: string,
  data: TimeBlockFormData
): Promise<TimeBlock> {
  const colRef = collection(db, COLLECTION);
  const docRef = await addDoc(colRef, toFirestore(data, userId));
  return {
    id: docRef.id,
    ...data,
    userId,
    createdAt: new Date(),
  };
}

export async function updateTimeBlock(
  id: string,
  data: Partial<TimeBlockFormData>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  const updateData: Record<string, any> = { ...data };
  if (data.start) updateData.start = Timestamp.fromDate(data.start);
  if (data.end) updateData.end = Timestamp.fromDate(data.end);
  await updateDoc(docRef, updateData);
}

export async function deleteTimeBlock(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

export async function findOverlappingBlock(
  userId: string,
  start: Date,
  end: Date,
  excludeId?: string
): Promise<TimeBlock | null> {
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  for (const d of snapshot.docs) {
    const block = fromFirestore(d.data(), d.id);
    if (excludeId && block.id === excludeId) continue;
    if (block.end > start && block.start < end) {
      return block;
    }
  }
  return null;
}