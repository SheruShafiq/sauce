export type Post = {
  id?: string; //The reason for optional ID is because it is generated by the server
  title: string;
  resource: string;
  authorID: string;
  description: string;
  categoryID: string;
  upvotes: number;
  downvotes: number;
  reports: number;
  reportIDs: string[];
  comments: number[];
  dateCreated: string;
  dateModified: string;
  dateDeleted: string;
};

export type User = {
  id?: string;
  username: string;
  password: string;
  displayName: string;
  posts: string[];
  upvotedPosts: string[];
  downVotedPosts: string[];
  reportedPosts: string[];
  comments: string[];
  dateCreated: string;
  dateModified: string;
  dateDeleted: string;
  likedComments: string[];
  dislikedComments: string[];
};
export type Comment = {
  id?: string;
  authorID: string;
  text: string;
  likes: number;
  dislikes: number;
  replies: string[];
  dateCreated: string;
  dateModified: string;
  dateDeleted: string;
  likedBy: string[];
  dislikedBy: string[];
  postID: string;
};

export type RowData = { col1: string; col2: string };

export type ExcelLog = {
  id?: string;
  rows: RowData[];
  dateCreated: string;
};
export type Category = {
  id: number;
  name: string;
  description: string;
  posts: string[];
  dateCreated: string;
  dateModified: string;
  dateDeleted: string;
  iconPath: string;
};
export type Report = {
  id: string;
  postID: string;
  authorID: string;
  reason: string;
  dateCreated: string;
  dateModified: string;
  dateDeleted: string;
};

export type fetchPostsProps = {
  onSuccess: (posts: Post[]) => void;
  onError: (errorProps: errorProps) => void;
};

export type PaginatedPostsResponse = {
  posts: Post[];
  metadata: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
};

export type fetchPostsPaginatedProps = {
  onSuccess: (response: PaginatedPostsResponse) => void;
  onError: (error: any) => void;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
};

export type standardFetchByIDProps = {
  onSuccess: (post: Post) => void;
  onError: (error: any) => void;
  id: string;
};
export type createPostProps = {
  title: string;
  resource: string;
  description: string;
  categoryID: string;
  authorID: string;
  onSuccess: (post: Post) => void;
  onError: (error: any) => void;
};
export type errorProps = {
  id: string;
  userFriendlyMessage: string;
  errorMessage: string;
  error: Error;
};

export type paginatedPostsMetaDataType = {
  first: string;
  prev: string;
  next: string;
  last: string;
};
export type VoteField =
  | "likes"
  | "dislikes"
  | "upvotes"
  | "downvotes"
  | "reports";
export type createUserProps = {
  username: string;
  password: string;
  displayName: string;
  onSuccess: (user: User) => void;
  onError: (error: any) => void;
};
export type PatchUserProps = {
  userID: string;
  field: keyof User;
  newValue: string[];
  onSuccess: (user: User) => void;
  onError: (error: any) => void;
};

export type loginUserProps = {
  username: string;
  password: string;
  onSuccess: (user: User) => void;
  onError: (error: any) => void;
};

export type LoginUserResponse = {
  users: User[];
};

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}
declare module "virtual:pwa-register" {
  import type { RegisterSWOptions } from "vite-plugin-pwa/types";

  export type { RegisterSWOptions };

  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}
