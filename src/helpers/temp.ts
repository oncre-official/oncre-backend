import { BadRequestException } from '@nestjs/common';
import * as Tmp from 'tmp';

export const saveTempFile = async (data, prefix) => {
  return await new Promise((resolve, reject) => {
    console.error(reject);

    Tmp.file({ discardDescriptor: true, prefix, postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
      if (err) throw new BadRequestException('Error creating file');

      await data.xlsx
        .writeFile(file)
        .then(() => {
          resolve(file);
        })
        .catch((err) => {
          throw new BadRequestException(err);
        });
    });
  });
};
