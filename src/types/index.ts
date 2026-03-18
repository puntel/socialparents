export interface Category {
    id: string;
    label: string;
    colorClass: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    relation: string;
    bio?: string;
    isPrivate: boolean;
}

export interface Post {
    id: string;
    authorName: string;
    authorRole: string; // Ex: "Mãe do Léo"
    categoryName: string;
    categoryColorClass: string;
    content: string;
    tags?: string[];
    isSensitive: boolean;
}
