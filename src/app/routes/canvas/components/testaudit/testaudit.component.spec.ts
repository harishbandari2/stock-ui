import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestauditComponent } from './testaudit.component';

describe('TestauditComponent', () => {
  let component: TestauditComponent;
  let fixture: ComponentFixture<TestauditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestauditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestauditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
