import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorEditComponent } from './connector-edit.component';

describe('ConnectorEditComponent', () => {
  let component: ConnectorEditComponent;
  let fixture: ComponentFixture<ConnectorEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectorEditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
