import { Injectable } from '@nestjs/common';
import { MOCK_USERS, type MockUser } from './users.data';

@Injectable()
export class UsersService {
  findByUsername(username: string): MockUser | undefined {
    return MOCK_USERS.find((user) => user.username === username);
  }
}
