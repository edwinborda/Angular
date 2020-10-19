import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/adm-postilion';
import { Observable } from 'rxjs';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { DataSourceRequestState, DataResult } from '@progress/kendo-data-query';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User } from 'src/models/user';
import { Message } from 'src/models/message';
import { tap, switchMap } from 'rxjs/operators';
import { map } from '@progress/kendo-data-query/dist/npm/transducers';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  private readonly EMAIL_PATTERN = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"; 
  private editedRowIndex: number;
  group: FormGroup;
  gridResult$: Observable<GridDataResult>;
  messageResponse$: Observable<Message>;
  state: DataSourceRequestState = {
    skip: 0,
    take: 30
  }
  
  constructor(private userServices: UserService) {
  }

  ngOnInit(): void {
    this.gridResult$ = this.userServices.getOdata(this.state);
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridResult$ = this.userServices.getOdata(this.state);
  }

  addHandler({sender}) {
    this.closeEditor(sender);
    this.setFormGroup();
    sender.addRow(this.group);
  }

  editHandler({sender, rowIndex, dataItem}) {
    this.setFormGroup(dataItem as User)
    this.editedRowIndex = rowIndex
    sender.editRow(rowIndex, this.group);
  }

  saveHandler({sender, rowIndex, formGroup, isNew}) {

    const user: User = formGroup.value;
    if(isNew)
      this.messageResponse$ = this.userServices.add(user);
    else
      this.messageResponse$ = this.userServices.update(user);
    
    sender.closeRow(rowIndex);

    this.gridResult$ = this.messageResponse$.pipe(
      switchMap(_ => this.userServices.getOdata(this.state))
    );
  }

  cancelHandler({sender, rowIndex}) {
    this.closeEditor(sender, rowIndex);
  }

  removeHandler({dataItem}) {
    this.messageResponse$ = this.userServices.delete(dataItem.Id);
    this.gridResult$ = this.messageResponse$.pipe(
      switchMap(_ => this.userServices.getOdata(this.state))
    );
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.group = undefined;
  }

  private setFormGroup(user: User = null)
  {
    this.group = new FormGroup({
      'Id': new FormControl(user?.Id),
      'Name': new FormControl(user?.Name, Validators.required),
      'LastName': new FormControl(user?.LastName, Validators.required),
      'PhoneNumber': new FormControl(user?.PhoneNumber,Validators.required),
      'Address': new FormControl(user?.Address, Validators.required),
      'Email': new FormControl(user?.Email, Validators.compose([Validators.required, Validators.pattern(this.EMAIL_PATTERN)]))
    });
  }
}
