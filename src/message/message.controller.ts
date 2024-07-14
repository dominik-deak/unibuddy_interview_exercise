import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { ObjectID } from 'mongodb';
import { IAuthenticatedUser } from '../authentication/jwt.strategy';
import { XApiKeyGuard } from '../authentication/XApiKeyGuard';
import { MessageLogic } from './message.logic';

import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageLogic: MessageLogic) {}

  @Post(':id/tags')
  @ApiSecurity('X-API-KEY')
  @UseGuards(XApiKeyGuard)
  @ApiBody({ type: [String] })
  async addTags(
    @Param('id') id: string,
    @Body() tags: string[],
    user: IAuthenticatedUser,
  ) {
    const objectId = new ObjectID(id);
    return await this.messageLogic.addTags(objectId, tags, user);
  }

  @Put(':id/tags')
  @ApiSecurity('X-API-KEY')
  @UseGuards(XApiKeyGuard)
  @ApiBody({ type: [String] })
  async updateTags(
    @Param('id') id: string,
    @Body() tags: string[],
    user: IAuthenticatedUser,
  ) {
    const objectId = new ObjectID(id);
    return await this.messageLogic.updateTags(objectId, tags, user);
  }

  @Get('search')
  @UseGuards(AuthGuard)
  async searchMessagesByTags(
    @Body() tags: string[],
    @User() user: IAuthenticatedUser,
  ) {
    return await this.messageLogic.searchMessagesByTags(tags, user);
  }
}
