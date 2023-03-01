import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {DsBoxModule, DsButtonModule, DsHeaderModule, DsImprintModule, DsNavigationBarModule} from '@bmw-ds/components';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports: [
        DsNavigationBarModule,
        DsHeaderModule,
        DsImprintModule.forRoot({
          phone: '5555555',
          electronicContact: 'change-me@bmwgroup.com'
        }),
        DsBoxModule,
        DsButtonModule
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'foo'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('foo');
  });

  it('should render text-paragraph', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-paragraph')?.textContent).toContain('Your app with Density is up and running');
  });
});
