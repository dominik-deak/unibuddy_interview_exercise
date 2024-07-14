import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { IAuthenticatedUser } from '../authentication/jwt.strategy';
import { MessageController } from './message.controller';
import { MessageLogic } from './message.logic';

describe('MessageController', () => {
  let messageController: MessageController;
  let messageLogic: MessageLogic;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageLogic,
          useValue: {
            addTags: jest.fn(),
            updateTags: jest.fn(),
            searchMessagesByTags: jest.fn(),
          },
        },
      ],
    }).compile();

    messageController = module.get<MessageController>(MessageController);
    messageLogic = module.get<MessageLogic>(MessageLogic);
  });

  it('should add tags via controller', async () => {
    const tags = ['tag1', 'tag2'];
    const user: IAuthenticatedUser = {
      userId: new ObjectID(),
      accountRole: 'user',
    };
    const validId = new ObjectID().toHexString();
    await messageController.addTags(validId, tags, user);
    expect(messageLogic.addTags).toHaveBeenCalledWith(validId, tags, user);
  });

  it('should update tags via controller', async () => {
    const tags = ['tag1', 'tag2'];
    const user: IAuthenticatedUser = {
      userId: new ObjectID(),
      accountRole: 'user',
    };
    const validId = new ObjectID().toHexString();
    await messageController.updateTags(validId, tags, user);
    expect(messageLogic.updateTags).toHaveBeenCalledWith(validId, tags, user);
  });

  it('should search messages by tags via controller', async () => {
    const tags = ['tag1', 'tag2'];
    const user: IAuthenticatedUser = {
      userId: new ObjectID(),
      accountRole: 'user',
    };
    await messageController.searchMessagesByTags(tags, user);
    expect(messageLogic.searchMessagesByTags).toHaveBeenCalledWith(tags, user);
  });
});
