export type Role = 'parent' | 'child';

export interface User {
    id: string;
    name: string;
    role: Role;
    stickers: number;
    allowance: number;
    profileImage?: string; // Optional emoji or url
}

export const MOCK_USERS: User[] = [
    { id: 'u1', name: '이수', role: 'child', stickers: 12, allowance: 5000, profileImage: '🐰' },
    { id: 'u2', name: '제이', role: 'child', stickers: 5, allowance: 2000, profileImage: '🐯' },
];

export interface Mission {
    id: string;
    userId: string; // Assigned child ID
    title: string;
    stickers: number; // Sticker reward
    allowanceReward?: number; // Optional money reward
    status: 'pending' | 'completed' | 'approved';
    completedAt?: string; // Date string YYYY-MM-DD
}

export const MOCK_MISSIONS: Mission[] = [
    { id: '1', userId: 'u1', title: '방 청소하기 🧹', stickers: 2, status: 'pending' },
    { id: '2', userId: 'u1', title: '숙제 끝내기 📝', stickers: 3, status: 'completed', completedAt: '2023-10-25' },
    { id: '3', userId: 'u1', title: '책 읽기 📖', stickers: 1, status: 'approved', completedAt: '2023-10-24' },
    { id: '4', userId: 'u2', title: '장난감 정리하기 🤖', stickers: 2, status: 'pending' },
];

export interface Transaction {
    id: string;
    userId: string;
    date: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
}

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', userId: 'u1', date: '2023-10-01', amount: 5000, description: '주간 용돈', type: 'income' },
    { id: '2', userId: 'u1', date: '2023-10-02', amount: 1500, description: '편의점 간식', type: 'expense' },
    { id: '3', userId: 'u2', date: '2023-10-05', amount: 3000, description: '심부름 보너스', type: 'income' },
];

export interface Notice {
    id: string;
    content: string;
    date?: string;
    author?: string;
}

export const MOCK_NOTICES: Notice[] = [
    { id: '1', content: "이번 주말에 할머니 오신대! 👵", date: '2023-10-27', author: 'mom' },
    { id: '2', content: "금요일까지 수학 숙제 제출하기! 📚", date: '2023-10-25', author: 'dad' },
];

export interface VoteOption {
    id: string;
    label: string;
    count: number;
}

export interface Vote {
    id: string;
    title: string;
    options: VoteOption[];
    hasVotedUsers: string[]; // List of user IDs who voted
    deadline?: string; // ISO Date String
}

export const MOCK_VOTES: Vote[] = [
    {
        id: '1',
        title: '오늘 저녁 메뉴는? 🍕',
        options: [
            { id: 'opt1', label: '피자', count: 2 },
            { id: 'opt2', label: '치킨', count: 1 },
            { id: 'opt3', label: '초밥', count: 0 },
        ],
        hasVotedUsers: []
    }
];
