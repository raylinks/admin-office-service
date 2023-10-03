import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as Excel from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Injectable()
export class ExcelService {
  async export(
    res: Response,
    data: any,
    transactionType: string,
    mode: string = 'single',
  ): Promise<fileExport> {
    switch (mode) {
      case 'single':
        return await this.prepareSingleExport(res, data, transactionType);
      case 'bulk':
        return await this.prepareBulkExport(res, data, transactionType);
    }
  }

  /**
   * Prepare excel header
   * @param data
   * @returns
   */
  private prepareHeader(data) {
    let headers = Object.keys(data);
    let payload = [];

    headers.forEach((header) => {
      payload.push({
        key: header,
        header: header.replace(
          /[A-Z]/g,
          (letter) => ` ${letter.toLowerCase()}`,
        ),
      });
    });
    return payload;
  }

  /**
   * Handle single data export
   * @param data
   * @param transactionType
   * @returns Promise<fileExport>
   */
  private async prepareSingleExport(res, data, transactionType): Promise<any> {
    // check if data is empty
    if (!data) {
      throw new NotFoundException('No data to export.');
    }

    delete data.id;

    const header = this.prepareHeader(data);
    const sheetName = `sheet1`;

    const workbook = new Excel.Workbook();

    const worksheet = workbook.addWorksheet(sheetName.toLocaleLowerCase());

    worksheet.columns = header;
    worksheet.addRow(data);

    const bookName = `single_${transactionType}_transaction.xlsx`;

    const exportPath = path.resolve(__dirname, bookName);

    await workbook.xlsx.writeFile(exportPath);

    return this.downloadFile(res, exportPath, bookName);
  }

  /**
   * Handle bulk data export
   * @param data
   * @param transactionType
   * @returns Promise<fileExport>
   */
  private async prepareBulkExport(res, data, transactionType): Promise<any> {
    // check if data is empty
    if (data.length < 0) {
      throw new NotFoundException('No data to export.');
    }

    const header = this.prepareHeader(data[0]);

    const sheetName = `${transactionType}`;

    const workbook = new Excel.Workbook();

    const worksheet = workbook.addWorksheet(sheetName.toLocaleLowerCase());

    worksheet.columns = header;
    data.forEach((datum) => {
      worksheet.addRow(datum);
    });

    const bookName = `bulk_${transactionType}_transactions.xlsx`;

    const exportPath = path.resolve(__dirname, bookName);

    await workbook.xlsx.writeFile(exportPath);

    return this.downloadFile(res, exportPath, bookName);
  }

  /**
   * Trigger file download
   * @param res
   * @param filePath
   * @param fileName
   */
  private downloadFile(res, filePath: string, fileName: string) {
    res.download(filePath, fileName, function (err) {
      if (err) {
        throw new BadRequestException(`Unable to download ${fileName} records`);
      }

      fs.unlinkSync(filePath);
    });
  }
}
