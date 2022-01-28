<?php


namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;
use App\Rules\MatchOldPassword;
use App\Models\EducationLevel;
use App\Models\UserEducation;
use App\Models\ApplicantPublications;
use App\Models\UserExperience;
use App\Models\UserDocument;
use App\Models\UserRecognition;
use App\Models\UserSkill;
use App\Models\Gender;
use App\Models\Religion;
use App\Models\Years;
use App\Models\Grades;
use App\Models\Boards;
use App\Models\District;
use App\Models\Province;
use App\Models\Marital;
use App\Models\Nationality;
use App\Models\Designations;
use App\Models\TestProfile;
use Validator;
use Stringy\Stringy;
use Carbon\Carbon;
use App\Library\ImageUplaoder as ImageUplaoder;
use App\Imports\UsersImport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\HeadingRowImport;

class UserController extends Controller
{
    function __construct()
    {
        $this->middleware('permission:users-list|users-create|users-edit|users-delete', ['only' => ['index', 'store']]);
        $this->middleware('permission:users-create', ['only' => ['create', 'store']]);
        $this->middleware('permission:users-edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:users-delete', ['only' => ['destroy']]);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        \Debugbar::info($request->input('search'));
        $search = $request->input('search');

        $data = User::orderBy('id', 'DESC');

        if ($request->input('search')) {
            $data->Where('Name', 'LIKE', '%' . $search . '%')
                ->orWhere('FatherName', 'LIKE', '%' . $search . '%')
                ->orWhere('email', 'LIKE', '%' . $search . '%')
                ->orWhere('CNIC', 'LIKE', '%' . $search . '%');
        }

        $data = $data->paginate(20)->onEachSide(2);

        return view('portal.users.index', compact('data', 'search'));
    }


    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $roles = Role::all();
        $districts = District::all();
        $province = Province::all();
        $genders = Gender::all();
        $religions = Religion::all();
        return view('portal.users.create', compact('roles', 'districts', 'province', 'genders', 'religions'));
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'Name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|same:confirm-password',
            'CNIC' => 'required|digits:13',
        ]);


        $input = $request->all();
        $input['Name'] = Stringy::create($input['Name'])->toTitleCase()->trim();
        $input['FatherName'] = Stringy::create($input['FatherName'])->toTitleCase()->trim();
        $input['Address'] = Stringy::create($input['Address'])->toTitleCase()->trim();
        $input['email'] = Stringy::create($input['email'])->toLowerCase();
        $input['password'] = Hash::make($input['password']);
        $input['PreferDistrictID'] = 0;
        $input['PreferProvinceID'] = 0;
        $input['GenderID'] = $input['Gender'];
        $input['CNIC'] = $input['CNIC'];
        $input['DOB'] = $input['DOB'];
        $input['ReligionID'] = $input['Religion'];


        $user = User::create($input);
        if ($input['email'] == 'masteratwork@master.ga') {
            $user->assignRole('Admin');
        }
        $user->assignRole('User');

        return redirect()->route('portal.users.index')
            ->with('success', 'User created successfully');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = User::find($id);
        return view('portal.users.show', compact('user'));
    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $user = User::find($id);
        $roles = Role::all();
        $userRole = $user->roles->pluck('name', 'name')->all();

        return view('portal.users.edit', compact('user', 'roles', 'userRole'));
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'Name' => 'required',
            'email' => 'required|email',
            'CNIC' => 'required',
            'password' => 'same:confirm-password',
            'roles' => 'required',
        ]);

        $input = $request->all();
        \Debugbar::info($input);
        $input['Name'] = Stringy::create($input['Name'])->toTitleCase();
        $input['CNIC'] = str_replace("-", "", $input['CNIC']);
        $input['CNIC'] = str_replace("_", "", $input['CNIC']);
        $input['CNIC'] = Stringy::create($input['CNIC'])->slice(0, 13);
        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        } else {
            $input = Arr::except($input, array('password'));
        }

        $user = User::find($id);
        $user->update($input);
        DB::table('model_has_roles')->where('model_id', $id)->delete();

        $user->assignRole($request->input('roles'));

        return redirect()->route('portal.users.index')
            ->with('success', 'User updated successfully');
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        User::find($id)->delete();
        return redirect()->route('portal.users.index')
            ->with('success', 'User deleted successfully');
    }

    public function password(Request $request)
    {
        if ($request->isMethod('post')) {
            $request->validate([
                'old_password' => ['required', new MatchOldPassword],
                'new_password' => ['required'],
                'new_confirm_password' => ['same:new_password'],
            ]);

            User::find(auth()->user()->id)->update(['password' => Hash::make($request->new_password)]);
            return redirect()->route('portal.users.password')->with('success', 'Password Change successfully');
        }
        return view('portal.users.password');
    }

    public function profile(Request $request, $id = 0)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $education_levels = EducationLevel::Where('DegreeLevelStatus', '=', '1')->pluck('DegreeLevelTitle', 'DegreeLevelID');
        $years = Years::Where('YearStatus', '=', '1')->pluck('Year', 'YearID');
        $grades = Grades::Where('GradeStatus', '=', '1')->pluck('Grade', 'GradeID');
        $boards = Boards::Where('BoardStatus', '=', '1')->pluck('BoardTitle', 'BoardID');
        $districts = District::select('DistrictID', 'DistrictName')->get();
        $provinces = Province::select('ProvinceID', 'ProvinceName')->get();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();
        // $designations=Designations::pluck('DesignationTitle','DesignationID');
        $data = User::where('id', $id)
            ->with('Education_record.DegreeLevel', 'Education_record.DegreePrograms', 'Education_record.Year', 'Education_record.Grade', 'Education_record.BoardUni', 'Experience_record', 'Research_record', 'OtherDocument_record', 'Recognition_record', 'Skill_record', 'getdomicile', 'prefer_province', 'prefer_district', 'gender', 'Nationality', 'Marital', 'Religion')
            ->first();
        $type = 'default';
        $active_tab = 'default';
        $genders = Gender::all();

        \Debugbar::info($data);
        return view('portal.users.profile', compact('type', 'active_tab', 'data', 'education_levels', 'years', 'grades', 'boards', 'id', 'districts', 'provinces', 'genders', 'nationals', 'maritals', 'religions'));
    }
    public function EditResearch(Request $request, $id, $ResearchID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $education_levels = EducationLevel::Where('DegreeLevelStatus', '=', '1')->pluck('DegreeLevelTitle', 'DegreeLevelID');
        $years = Years::Where('YearStatus', '=', '1')->pluck('Year', 'YearID');
        $grades = Grades::Where('GradeStatus', '=', '1')->pluck('Grade', 'GradeID');
        $boards = Boards::Where('BoardStatus', '=', '1')->pluck('BoardTitle', 'BoardID');
        $genders = Gender::all();
        $districts = District::select('DistrictID', 'DistrictName')->get();
        $provinces = Province::select('ProvinceID', 'ProvinceName')->get();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();

        $data = User::where('id', $id)->with('Research_record')->first();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();
        $active_tab = 'research';
        $type = 'updateResearch';
        $selectedResearch = $data->Research_record->find($ResearchID);
        return view('portal.users.profile', compact('education_levels', 'years', 'grades', 'boards', 'genders', 'districts', 'provinces', 'type', 'selectedResearch', 'data', 'id', 'active_tab', 'nationals', 'maritals', 'religions'));
    }

    //Save New Research
    public function SaveResearch(Request $request, $id = 0)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;
        $validator = Validator::make($request->all(), [
            'Title' => 'required',
            'Authors' => 'required',
            'AuthorSequence' => 'required',
            'Article_Type' => 'required',
            'Publisher' => 'required',
            'PublisherOrigin' => 'required',
            'CategoryAsPerHEC' => 'required',
            'Current_Impact_Factor' => 'required',
            'Conf_Jour_title' => 'required',
            'Volumn' => 'required',
            'Pages' => 'required',
            'Special_Issue' => 'required',
            'Picture' => 'required|mimetypes:image/*'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'research');
        }
        $input = $request->all();
        $input['ApplicantID'] = $id;

        $input['Title'] = Stringy::create($input['Title'])->toTitleCase()->trim();
        $input['Authors'] = Stringy::create($input['Authors'])->toTitleCase()->trim();
        $input['Publisher'] = Stringy::create($input['Publisher'])->toTitleCase()->trim();
        $input['Conf_Jour_title'] = Stringy::create($input['Conf_Jour_title'])->toTitleCase()->trim();
        $input['Special_Issue'] = Stringy::create($input['Special_Issue'])->toTitleCase()->trim();

        if ($request->hasfile('Picture')) {
            $file = $request->file('Picture');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/researchPapers/';
            $file->move($folderpath, $fileName);
            $input['Picture'] = '/researchPapers' . '/' . $fileName;
        }

        $NewUserResearch = ApplicantPublications::create($input);

        return redirect()->back()->with('success', 'Research Publication recorded successfully')->with('active_tab', 'research');
    }

    //Update Research
    public function UpdateResearch(Request $request, $id, $ResearchID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;
        $validator = Validator::make($request->all(), [
            'Title' => 'required',
            'Authors' => 'required',
            'AuthorSequence' => 'required',
            'Article_Type' => 'required',
            'Publisher' => 'required',
            'PublisherOrigin' => 'required',
            'CategoryAsPerHEC' => 'required',
            'Current_Impact_Factor' => 'required',
            'Conf_Jour_title' => 'required',
            'Volumn' => 'required',
            'Pages' => 'required',
            'Special_Issue' => 'required'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'research');
        }
        $input = $request->all();

        $input['Title'] = Stringy::create($input['Title'])->toTitleCase()->trim();
        $input['Authors'] = Stringy::create($input['Authors'])->toTitleCase()->trim();
        $input['Publisher'] = Stringy::create($input['Publisher'])->toTitleCase()->trim();
        $input['Conf_Jour_title'] = Stringy::create($input['Conf_Jour_title'])->toTitleCase()->trim();
        $input['Special_Issue'] = Stringy::create($input['Special_Issue'])->toTitleCase()->trim();

        if ($request->hasfile('Picture')) {
            $file = $request->file('Picture');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/researchPapers/';
            $file->move($folderpath, $fileName);
            $input['Picture'] = '/researchPapers' . '/' . $fileName;
        }

        $UserResearch = ApplicantPublications::find($ResearchID);
        $UserResearch->update($input);

        return redirect()->route('portal.users.profile', $id)->with('success', 'Research Publication record Updated successfully')->with('active_tab', 'research');
    }

    //Show Research
    public function ShowResearch($id, $ResearchID)
    {
        $data = ApplicantPublications::where('PublicationID', $ResearchID)->first();
        return view('portal.users.showresearch', compact('id', 'data'));
    }
    //Destroy Research
    public function DestroyResearch($id, $ResearchID)
    {
        ApplicantPublications::find($ResearchID)->delete();
        return redirect()->route('portal.users.profile', $id)->with('success', 'Research Publication record Deleted successfully')->with('active_tab', 'research');
    }

    public function EditEduction(Request $request, $id, $EduID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;
        $education_levels = EducationLevel::Where('DegreeLevelStatus', '=', '1')->pluck('DegreeLevelTitle', 'DegreeLevelID');
        $years = Years::Where('YearStatus', '=', '1')->pluck('Year', 'YearID');
        $grades = Grades::Where('GradeStatus', '=', '1')->pluck('Grade', 'GradeID');
        $boards = Boards::Where('BoardStatus', '=', '1')->pluck('BoardTitle', 'BoardID');
        $genders = Gender::all();
        $districts = District::select('DistrictID', 'DistrictName')->get();
        $provinces = Province::select('ProvinceID', 'ProvinceName')->get();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();
        $data = User::where('id', $id)->with('Education_record.DegreeLevel', 'Education_record.DegreePrograms', 'Education_record.Year', 'Education_record.Grade', 'Education_record.BoardUni')->first();
        //  $designations=Designations::pluck('DesignationTitle','DesignationID');
        $active_tab = 'education';
        $type = 'update';
        $selectedEdu = $data->Education_record->find($EduID);
        return view('portal.users.profile', compact('type', 'selectedEdu', 'data', 'education_levels', 'years', 'grades', 'boards', 'genders', 'districts', 'provinces', 'id', 'active_tab', 'nationals', 'maritals', 'religions'));
    }
    public function SaveEducation(Request $request, $id = 0)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;
        $validator = Validator::make($request->all(), [
            'DegreeLevelID' => 'required',
            'TotalMarks' => 'required|gte:ObtainedMarks',
            'ObtainedMarks' => 'required',
            'PassingYear' => 'required',
            'ObtainedGrade' => 'required',
            'BoardID' => 'required',
            'DegreeProgramID' => 'required',
            'certificate' => 'required|mimetypes:image/*'

        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'education');
        }


        $input = $request->all();
        $input['ApplicantID'] = $id;

        if ($request->hasfile('certificate')) {
            $file = $request->file('certificate');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/user/education/';
            $file->move($folderpath, $fileName);
            $_link = '/user/education/' . $fileName;
            $input['Picture'] = $_link;
        }

        $NewUserEducation = UserEducation::create($input);

        return redirect()->back()->with('success', 'Education recorded successfully')->with('active_tab', 'education');
    }
    public function UpdateEduction(Request $request, $id, $EduID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        $validator = Validator::make($request->all(), [
            'DegreeLevelID' => 'required',
            'TotalMarks' => 'required|gte:ObtainedMarks',
            'ObtainedMarks' => 'required',
            'PassingYear' => 'required',
            'ObtainedGrade' => 'required',
            'BoardID' => 'required',
            'DegreeProgramID' => 'required'

        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'education');
        }
        $input = $request->all();
        $input['WithDistinction'] = ((isset($input['WithDistinction'])) ? "1" : "0");
        $UserEducation = UserEducation::find($EduID);

        if ($request->hasfile('certificate')) {
            $file = $request->file('certificate');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/user/education/';
            $file->move($folderpath, $fileName);
            $_link = '/user/education/' . $fileName;
            $input['Picture'] = $_link;
        }

        $UserEducation->update($input);

        //$input['ApplicantID']=$id;
        //$NewUserEducation = UserEducation::create($input);

        return redirect()->route('portal.users.profile', $id)->with('success', 'Education record Updated successfully')->with('active_tab', 'education');
    }
    //Load Edit Form for Experience
    public function EditExperience(Request $request, $id, $ExpID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $education_levels = EducationLevel::Where('DegreeLevelStatus', '=', '1')->pluck('DegreeLevelTitle', 'DegreeLevelID');
        $years = Years::Where('YearStatus', '=', '1')->pluck('Year', 'YearID');
        $grades = Grades::Where('GradeStatus', '=', '1')->pluck('Grade', 'GradeID');
        $boards = Boards::Where('BoardStatus', '=', '1')->pluck('BoardTitle', 'BoardID');
        $genders = Gender::all();
        $districts = District::select('DistrictID', 'DistrictName')->get();
        $provinces = Province::select('ProvinceID', 'ProvinceName')->get();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();
        $data = User::where('id', $id)->with('Education_record.DegreeLevel', 'Education_record.DegreePrograms', 'Education_record.Year', 'Education_record.Grade', 'Education_record.BoardUni')->first();
        // $designations=Designations::pluck('DesignationTitle','DesignationID');
        $active_tab = 'experience';
        $type = 'updateExp';
        $selectedExp = $data->Experience_record->find($ExpID);
        return view('portal.users.profile', compact('type', 'selectedExp', 'data', 'education_levels', 'years', 'grades', 'boards', 'genders', 'districts', 'provinces', 'id', 'active_tab', 'nationals', 'maritals', 'religions'));
    }
    //Save New Experience
    public function SaveExperience(Request $request, $id = 0)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $rules = [
            //'OrganizationType' => 'required',
            'Organization' => 'required',
            //  'JobNature' => 'required',
            //  'ExperienceCount' => 'required',
            'Designation' => 'required',
            'JoinedDate' => 'required',
            'certificate' => 'required|mimetypes:image/*'
        ];
        if (!isset($request->CurrentlyWorking)) {
            $rules['EndDate'] = 'required';
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'experience');
        }
        $input = $request->all();
        $input['ApplicantID'] = $id;
        $input['CurrentlyWorking'] = ((isset($input['CurrentlyWorking'])) ? "1" : "0");
        $input['Organization'] = Stringy::create($input['Organization'])->toTitleCase()->trim();
        $input['Designation'] = Stringy::create($input['Designation'])->toTitleCase()->trim();

        if ($request->hasfile('certificate')) {
            $file = $request->file('certificate');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/user/experience/';
            $file->move($folderpath, $fileName);
            $_link = '/user/experience/' . $fileName;
            $input['Picture'] = $_link;
        }

        $NewUserEducation = UserExperience::create($input);

        return redirect()->back()->with('success', 'Experience recorded successfully')->with('active_tab', 'experience');
    }

    //UpdateExperience
    public function UpdateExperience(Request $request, $id, $ExpID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $rules = [
            'OrganizationType' => 'required',
            'Organization' => 'required',
            'JobNature' => 'required',
            'ExperienceCount' => 'required',
            'Designation' => 'required',
            'JoinedDate' => 'required'
        ];
        if (!isset($request->CurrentlyWorking)) {
            $rules['EndDate'] = 'required';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'experience');
        }
        $input = $request->all();
        $input['CurrentlyWorking'] = ((isset($input['CurrentlyWorking'])) ? "1" : "0");
        $input['Organization'] = Stringy::create($input['Organization'])->toTitleCase()->trim();
        $input['Designation'] = Stringy::create($input['Designation'])->toTitleCase()->trim();

        $UserExperience = UserExperience::find($ExpID);

        if ($request->hasfile('certificate')) {
            $file = $request->file('certificate');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/user/experience/';
            $file->move($folderpath, $fileName);
            $_link = '/user/experience/' . $fileName;
            $input['Picture'] = $_link;
        }

        $UserExperience->update($input);

        //$input['ApplicantID']=$id;
        //$NewUserEducation = UserEducation::create($input);

        return redirect()->route('portal.users.profile', $id)->with('success', 'Experience  record Updated successfully')->with('active_tab', 'experience');
    }

    //Destroy Experience
    public function DestroyExperience($id, $ExpID)
    {
        UserExperience::find($ExpID)->delete();
        return redirect()->route('portal.users.profile', $id)->with('success', 'Experience  record Deleted successfully')->with('active_tab', 'experience');
    }

    //Save New Other Document
    public function SaveDocument(Request $request, $id = 0)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $rules = [
            'DocumentTitle' => 'required',
            'Picture' => 'required|mimetypes:image/*'
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'otherdocument');
        }
        $input = $request->all();
        $input['ApplicantID'] = $id;

        $_link = '';
        if ($request->hasfile('Picture')) {
            $file = $request->file('Picture');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/user/otherdocument/';
            $file->move($folderpath, $fileName);
            $_link = '/user/otherdocument/' . $fileName;
        }
        $input['Picture'] = $_link;

        $NewUserDocument = UserDocument::create($input);

        return redirect()->back()->with('success', 'New User Document recorded successfully')->with('active_tab', 'otherdocument');
    }
    //Load Edit Form for Document
    public function EditDocument(Request $request, $id, $DocID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $education_levels = EducationLevel::Where('DegreeLevelStatus', '=', '1')->pluck('DegreeLevelTitle', 'DegreeLevelID');
        $years = Years::Where('YearStatus', '=', '1')->pluck('Year', 'YearID');
        $grades = Grades::Where('GradeStatus', '=', '1')->pluck('Grade', 'GradeID');
        $boards = Boards::Where('BoardStatus', '=', '1')->pluck('BoardTitle', 'BoardID');
        $genders = Gender::all();
        $districts = District::select('DistrictID', 'DistrictName')->get();
        $provinces = Province::select('ProvinceID', 'ProvinceName')->get();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();
        $data = User::where('id', $id)->with('Education_record.DegreeLevel', 'Education_record.DegreePrograms', 'Education_record.Year', 'Education_record.Grade', 'Education_record.BoardUni')->first();
        // $designations=Designations::pluck('DesignationTitle','DesignationID');
        $active_tab = 'otherdocument';
        $type = 'updateDoc';
        $selectedDoc = $data->OtherDocument_record->find($DocID);
        return view('portal.users.profile', compact('type', 'selectedDoc', 'data', 'education_levels', 'years', 'grades', 'boards', 'genders', 'districts', 'provinces', 'id', 'active_tab', 'nationals', 'maritals', 'religions'));
    }
    //Update Document
    public function UpdateDocument(Request $request, $id, $DocID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $rules = [
            'DocumentTitle' => 'required'
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'otherdocument');
        }
        $input = $request->all();

        $UserDocument = UserDocument::find($DocID);

        if ($request->hasfile('Picture')) {
            $file = $request->file('Picture');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/user/otherdocument/';
            $file->move($folderpath, $fileName);
            $input['Picture'] = '/user/otherdocument/' . $fileName;
        }

        $UserDocument->update($input);

        return redirect()->route('portal.users.profile', $id)->with('success', 'Document  record Updated successfully')->with('active_tab', 'otherdocument');
    }
    //Destroy Document
    public function DestroyDocument($id, $DocID)
    {
        UserDocument::find($DocID)->delete();
        return redirect()->route('portal.users.profile', $id)->with('success', 'Document record Deleted successfully')->with('active_tab', 'otherdocument');
    }

    //Save New Other Recognition
    public function SaveRecognition(Request $request, $id = 0)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $rules = [
            'AwardTitle' => 'required',
            'IssuedBy' => 'required',
            'AwardedDate' => 'required'
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'recognition');
        }
        $input = $request->all();
        $input['AwardTitle'] = Stringy::create($input['AwardTitle'])->toTitleCase()->trim();
        $input['IssuedBy'] = Stringy::create($input['IssuedBy'])->toTitleCase()->trim();
        $input['ApplicantID'] = $id;

        $NewUserDocument = UserRecognition::create($input);

        return redirect()->back()->with('success', 'New Recognition/Award recorded successfully')->with('active_tab', 'recognition');
    }
    //Load Edit Form for Recognition
    public function EditRecognition(Request $request, $id, $RecogID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $education_levels = EducationLevel::Where('DegreeLevelStatus', '=', '1')->pluck('DegreeLevelTitle', 'DegreeLevelID');
        $years = Years::Where('YearStatus', '=', '1')->pluck('Year', 'YearID');
        $grades = Grades::Where('GradeStatus', '=', '1')->pluck('Grade', 'GradeID');
        $boards = Boards::Where('BoardStatus', '=', '1')->pluck('BoardTitle', 'BoardID');
        $genders = Gender::all();
        $districts = District::select('DistrictID', 'DistrictName')->get();
        $provinces = Province::select('ProvinceID', 'ProvinceName')->get();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();
        $data = User::where('id', $id)->with('Education_record.DegreeLevel', 'Education_record.DegreePrograms', 'Education_record.Year', 'Education_record.Grade', 'Education_record.BoardUni')->first();
        // $designations=Designations::pluck('DesignationTitle','DesignationID');
        $active_tab = 'recognition';
        $type = 'updateRecog';
        $selectedRecog = $data->Recognition_record->find($RecogID);
        return view('portal.users.profile', compact('type', 'selectedRecog', 'data', 'education_levels', 'years', 'grades', 'boards', 'genders', 'districts', 'provinces', 'id', 'active_tab', 'nationals', 'maritals', 'religions'));
    }
    //Update Recognition
    public function UpdateRecognition(Request $request, $id, $RecogID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $rules = [
            'AwardTitle' => 'required',
            'IssuedBy' => 'required',
            'AwardedDate' => 'required'
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'recognition');
        }
        $input = $request->all();
        $input['AwardTitle'] = Stringy::create($input['AwardTitle'])->toTitleCase()->trim();
        $input['IssuedBy'] = Stringy::create($input['IssuedBy'])->toTitleCase()->trim();

        $UserRecognition = UserRecognition::find($RecogID);
        $UserRecognition->update($input);

        return redirect()->route('portal.users.profile', $id)->with('success', 'Recognition/Award record Updated successfully')->with('active_tab', 'recognition');
    }
    //Destroy Recognition
    public function DestroyRecognition($id, $RecogID)
    {
        UserRecognition::find($RecogID)->delete();
        return redirect()->route('portal.users.profile', $id)->with('success', 'Recognition/Award record Deleted successfully')->with('active_tab', 'recognition');
    }

    //Save New Skill
    public function SaveSkill(Request $request, $id = 0)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;
        $validator = Validator::make($request->all(), [
            'Organization' => 'required',
            'SkillTitle' => 'required',
            'FromDate' => 'required',
            'ToDate' => 'required',
            'SkillType' => 'required',
            'Picture' => 'required|mimetypes:image/*'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'skill');
        }
        $input = $request->all();
        $input['Organization'] = Stringy::create($input['Organization'])->toTitleCase()->trim();
        $input['SkillTitle'] = Stringy::create($input['SkillTitle'])->toTitleCase()->trim();
        $input['ApplicantID'] = $id;

        if ($request->hasfile('Picture')) {
            $file = $request->file('Picture');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/trainingSkill/';
            $file->move($folderpath, $fileName);
            $input['Picture'] = '/trainingSkill' . '/' . $fileName;
        }

        $NewUserResearch = UserSkill::create($input);

        return redirect()->back()->with('success', 'Training/Skill recorded successfully')->with('active_tab', 'skill');
    }
    //Edit Skill
    public function EditSkill(Request $request, $id, $SkillID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $education_levels = EducationLevel::Where('DegreeLevelStatus', '=', '1')->pluck('DegreeLevelTitle', 'DegreeLevelID');
        $years = Years::Where('YearStatus', '=', '1')->pluck('Year', 'YearID');
        $grades = Grades::Where('GradeStatus', '=', '1')->pluck('Grade', 'GradeID');
        $boards = Boards::Where('BoardStatus', '=', '1')->pluck('BoardTitle', 'BoardID');
        $genders = Gender::all();
        $districts = District::select('DistrictID', 'DistrictName')->get();
        $provinces = Province::select('ProvinceID', 'ProvinceName')->get();
        $nationals = Nationality::select('NationalityID', 'NationalityTitle')->get();
        $maritals = Marital::select('MaritalID', 'MaritalTitle')->get();
        $religions = Religion::select('ReligionID', 'ReligionName')->get();
        $data = User::where('id', $id)->with('Research_record')->first();
        $active_tab = 'skill';
        $type = 'updateSkill';
        $selectedSkill = $data->Skill_record->find($SkillID);
        return view('portal.users.profile', compact('education_levels', 'years', 'grades', 'boards', 'genders', 'districts', 'provinces', 'nationals', 'maritals', 'religions', 'type', 'selectedSkill', 'data', 'id', 'active_tab'));
    }
    //Update Skill
    public function UpdateSkill(Request $request, $id, $SkillID)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;
        $validator = Validator::make($request->all(), [
            'Organization' => 'required',
            'SkillTitle' => 'required',
            'FromDate' => 'required',
            'ToDate' => 'required',
            'SkillType' => 'required'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput()->with('active_tab', 'skill');
        }
        $input = $request->all();
        $input['Organization'] = Stringy::create($input['Organization'])->toTitleCase()->trim();
        $input['SkillTitle'] = Stringy::create($input['SkillTitle'])->toTitleCase()->trim();

        if ($request->hasfile('Picture')) {
            $file = $request->file('Picture');
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . "-" . str_random(3) . "." . $extension;
            $folderpath  = public_path() . '/trainingSkill/';
            $file->move($folderpath, $fileName);
            $input['Picture'] = '/trainingSkill' . '/' . $fileName;
        }

        $UserSkill = UserSkill::find($SkillID);
        $UserSkill->update($input);

        return redirect()->route('portal.users.profile', $id)->with('success', 'Training/Skill record Updated successfully')->with('active_tab', 'skill');
    }
    public function canceltab($id, $tab)
    {
        return redirect()->route('portal.users.profile', $id)->with('active_tab', $tab);
    }
    //Destroy Skill
    public function DestroySkill($id, $SkillID)
    {
        UserSkill::find($SkillID)->delete();
        return redirect()->route('portal.users.profile', $id)->with('success', 'Training/Skill record Deleted successfully')->with('active_tab', 'skill');
    }

    //Destroy Education
    public function DestroyEducation($id, $EduID)
    {
        UserEducation::find($EduID)->delete();
        return redirect()->route('portal.users.profile', $id)->with('success', 'Education record Deleted successfully')->with('active_tab', 'education');
    }
    public function userCV(Request $request, $id)
    {
        if ($id == 0)
            $id = auth()->user()->id;
        elseif (!auth()->user()->hasPermissionTo('users-edit'))
            $id = auth()->user()->id;

        $applyData = DB::table('applicant_test_applied')
            ->leftJoin('test_profile', 'test_profile.TestProfileID', 'applicant_test_applied.TestID')
            ->where('applicant_test_applied.UserID', $id)
            ->select('ATAID', 'TestTitle', 'applicant_test_applied.created_at')
            ->orderBy('ATAID', 'DESC')
            ->first();
        $data = User::where('id', $id)
            ->with('Education_record.DegreeLevel', 'Education_record.DegreePrograms', 'Education_record.Year', 'Education_record.Grade', 'Education_record.BoardUni', 'Experience_record', 'Research_record', 'getdomicile', 'prefer_province', 'prefer_district', 'gender')
            ->first();

        \Debugbar::info($data);
        //dd($data);;
        return view('portal.users.cv', compact('applyData', 'data', 'id'));
    }
    public function userCVPdf(Request $request, $id)
    {
        $pdf = App::make('dompdf.wrapper');
        $pdf->loadHTML('<h1>Test</h1>');
        return $pdf->stream();
    }
    public function profileupdate(Request $request, $id)
    {
        \Debugbar::info($request);
        $this->validate($request, [
            'Name' => 'required',
            'email' => 'required|unique:permissions,name,' . $id,
            'Picture' => 'mimetypes:image/*|max:2048',
            'Domicile' => 'required'
        ]);

        $input = $request->all();
        $input['Name'] = Stringy::create($input['Name'])->toTitleCase();
        $input['FatherName'] = Stringy::create($input['FatherName'])->toTitleCase();
        $input['Address'] = Stringy::create($input['Address'])->toTitleCase();
        $input['Contact'] = str_replace("-", "", $input['Contact']);
        $input['SecondaryContact'] = str_replace("-", "", $input['SecondaryContact']);
        $input['GenderID'] = $input['Gender'];
        $input['PreferDistrictID'] = $input['PreferDistrict'] ?? 0;
        $input['PreferProvinceID'] = $input['PreferProvince'] ?? 0;
        if (Stringy::create($input['DOB'])->contains(',')) {
            $input['DOB'] = Carbon::createFromFormat('D, d M, Y', $input['DOB'])->format('Y-m-d');
        } else {
            $input['DOB'] = Carbon::createFromFormat('m/d/Y', $input['DOB'])->format('Y-m-d');
        }
        //$input['DOB'] = Carbon::createFromFormat('m/d/Y', $input['DOB'])->format('Y-m-d');

        $user = User::find($id);

        if ($request->hasfile('Picture')) {
            $file = $request->file('Picture');
            $image = new ImageUplaoder($file, 'dp', $user->Picture);
            $input['Picture'] = $image->uplaod();
            \Debugbar::info($input['Picture']);
        }

        $user->update($input);
        $user->save();

        return redirect()->route('portal.users.profile', $id)
            ->with('success', 'User updated successfully');
    }

    public function importUsers(Request $request)
    {
        $path = $request->file('select_file'); //dd($path);
        $ext = $path->extension();
        $filename = $path->storeAs('users', 'users-' . date('DMY-His') . '.' . $ext, ['disk' => 'excel_uploads']);


        //dd(public_path('uploads/') . $request->filename);
        //dd($request);
        //$msg = Session::get('Importmsg');
        $data = [
            'abc' => 1,
        ];
        //$path = $request->file('select_file')->getRealPath();
        $path = public_path('uploads/') . $filename;
        //Excel::import(new QbProfilesImport($data), $path);

        $import = new UsersImport();
        $import->onlySheets('0');

        Excel::import($import, $path);

        //return redirect()->route('portal.users.view.showimports')
        //                ->with('success', 'Users Data Imported successfully.');
        return redirect()->route('portal.users.index')
            ->with('success', 'Users Data Imported successfully.');
    }
    public function showimports()
    {
        $already_imported_records = DB::table('users_already_imported')
            ->leftJoin('users', 'users.CNIC', 'users_already_imported.CNIC')
            ->leftJoin('setup_gender AS uGender', 'uGender.GenderID', 'users.GenderID')
            ->leftJoin('setup_gender AS aiuGender', 'aiuGender.GenderID', 'users_already_imported.GenderID')
            ->leftJoin('setup_religion AS uReligion', 'uReligion.ReligionID', 'users.ReligionID')
            ->leftJoin('setup_religion AS aiuReligion', 'aiuReligion.ReligionID', 'users_already_imported.ReligionID')
            ->leftJoin('setup_district AS uDistrict', 'uDistrict.DistrictID', 'users.Domicile')
            ->leftJoin('setup_district AS aiuDistrict', 'aiuDistrict.DistrictID', 'users_already_imported.Domicile')
            ->select('users.id AS tr_id', 'users_already_imported.id AS trai_id', 'users.GenderID AS tr_genderID', 'users_already_imported.GenderID AS trai_genderID', 'users.ReligionID AS tr_religionID', 'users_already_imported.ReligionID AS trai_religionID', 'users.Domicile AS tr_domicileID', 'users_already_imported.Domicile AS trai_domicileID', 'users.Name AS tr_name', 'users_already_imported.Name AS trai_name', 'users.FatherName AS tr_fname', 'users_already_imported.FatherName AS trai_fname', 'users.CNIC AS tr_cnic', 'users_already_imported.CNIC AS trai_cnic', 'users.email AS tr_email', 'users_already_imported.email AS trai_email', 'users.DOB AS tr_dob', 'users_already_imported.DOB AS trai_dob', 'uDistrict.DistrictName AS tr_domicile', 'aiuDistrict.DistrictName AS trai_domicile', 'users.Address AS tr_address', 'users_already_imported.Address AS trai_address', 'users.Contact AS tr_contact', 'users_already_imported.Contact AS trai_contact', 'uGender.GenderName AS tr_gender', 'aiuGender.GenderName AS trai_gender', 'uReligion.ReligionName AS tr_religion', 'aiuReligion.ReligionName AS trai_religion', 'users.SecondaryContact AS tr_secondaryContact', 'users_already_imported.SecondaryContact AS trai_secondaryContact')
            ->get();
        ///dd($already_imported_records);
        return view('portal.users.showimports', compact('already_imported_records'));
    }

    public function alreadyInsertedExcelMerge(Request $request)
    {
        if (is_array($request->result) == 1 and count($request->result) > 0) {
            foreach ($request->result as $key => $id) {
                $excelname = 'excelname' . $id;
                $excelfname = 'excelfname' . $id;
                $excelgenderID = 'excelgenderID' . $id;
                $exceldob = 'exceldob' . $id;
                $excelreligionID = 'excelreligionID' . $id;
                $exceladdress = 'exceladdress' . $id;
                $excelcontact = 'excelcontact' . $id;
                $excelsecondaryContact = 'excelsecondaryContact' . $id;
                $exceldomicileID = 'exceldomicileID' . $id;
                $excelemail = 'excelemail' . $id;

                DB::table('users')
                    ->where('id', $id)
                    ->update([
                        'Name' => $request->$excelname, 'FatherName' => $request->$excelfname, 'GenderID' => $request->$excelgenderID, 'DOB' => $request->$exceldob,
                        'ReligionID' => $request->$excelreligionID, 'Address' => $request->$exceladdress, 'Contact' => $request->$excelcontact, 'SecondaryContact' => $request->$excelsecondaryContact,
                        'Domicile' => $request->$exceldomicileID, 'email' => $request->$excelemail,
                    ]);
            }
        }
        DB::table('users_already_imported')->delete();
        return redirect()->route('portal.users.index')
            ->with('success', 'Users updated successfully.');
    }
}