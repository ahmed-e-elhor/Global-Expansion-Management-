import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocumentDocument = DocumentModel & Document;

@Schema({ timestamps: true })
export class DocumentModel {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, required: true })
  projectId: string; // UUID from MySQL

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);

// Create index for text search
DocumentSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  projectId: 'text',
});
